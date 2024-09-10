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
  if (annotationParameters) {
    const valueRecord: Record<string, Child> = {"" : annotationParameters};
    return <jv.Annotation type={kind} value={valueRecord}></jv.Annotation>
  }
  return <jv.Annotation type={kind}></jv.Annotation>
}


export const SpringAnnotations = new Map<string, Refkey>([
  ["get", springFramework.GetMapping],
  ["put", springFramework.PutMapping],
  ["delete", springFramework.DeleteMapping],
  ["post", springFramework.PostMapping],
  ["patch", springFramework.PatchMapping],
  ["body", springFramework.RequestBody],
  ["path", springFramework.PathVariable],
  ["header", springFramework.RequestHeader],
  ["query", springFramework.RequestParam],
])

export function collectAnnotations(op: HttpOperation) {
  
  const route = op.verb;
  const path = op.uriTemplate;
  
  const routeAnnotation = <SpringAnnotation annotationKind={route} annotationParameters={path}></SpringAnnotation>

  /**filters out parameter properties taken from a model type. If the parameter type is a model
   * then all the properties of that model will be present in parameters.properties.
  */
  const parameterProperties = op.parameters.properties.filter(
    (httpProperty) => {
      return !(httpProperty.kind === "bodyProperty" && httpProperty.path.length > 1);
    }
  );

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
      annotationKind = property.kind;
      annotationParameters = property.options.name;
      break;
    case "body":
    case "multipartBody":
    case "bodyRoot":
    case "statusCode":
      annotationKind = property.kind;
      break;
    case "bodyProperty":
      return null;
    default:
      annotationKind = property.kind;
  }

  return <SpringAnnotation annotationKind={annotationKind} annotationParameters={annotationParameters}/>
}
