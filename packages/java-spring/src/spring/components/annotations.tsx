import * as jv from "@alloy-js/java"
import { Child, Refkey } from "@alloy-js/core";
import { springFramework } from "../libraries/index.js";
import { HttpOperation, HttpProperty } from "@typespec/http";

export interface AnnotationsProps {
  annotationKind: string;
  annotationParameters?: string;
}

export function SpringAnnotation({annotationKind, annotationParameters}: AnnotationsProps) {
  const kind = SpringAnnotations.get(annotationKind);
  const valueRecord: Record<string, Child> = {"" : annotationParameters};
  return <jv.Annotation type={kind} value={valueRecord}></jv.Annotation>
}


export const SpringAnnotations = new Map<string, Refkey>([
  ["get", springFramework.GetMapping],
  ["put", springFramework.PutMapping],
  ["delete", springFramework.DeleteMapping],
  ["post", springFramework.PostMapping],
  ["body", springFramework.RequestBody],
  ["path", springFramework.PathVariable],
  ["header", springFramework.RequestHeader]
])

export function collectAnnotations(op: HttpOperation) {
  
  const route = op.verb;
  const path = op.uriTemplate;
  
  const routeAnnotation = <SpringAnnotation annotationKind={route} annotationParameters={path}></SpringAnnotation>

  const parameterProperties = op.parameters.properties;
  const parameterAnnotations = parameterProperties.map(httpProperty => ({
    property: httpProperty,
    annotation: getParamAnnotation(httpProperty)
  }));

  return {
    routeAnnotation,
    parameterAnnotations,
  };

}

function getParamAnnotation(property: HttpProperty) {

  let annotationKind : string;
  let annotationParameters : string | undefined;

  switch (property.kind) {
    case "header":
    case "query":
      annotationKind = property.property.name;
      annotationParameters = property.options.name;
      break;
    case "body":
    case "multipartBody":
    case "bodyRoot":
    case "statusCode":
      annotationKind = property.property.name;
      break;

    default:
      annotationKind = property.property.name;
  }

  return <SpringAnnotation annotationKind={annotationKind} annotationParameters={annotationParameters}/>
}
