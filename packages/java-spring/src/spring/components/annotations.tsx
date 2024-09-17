import * as jv from "@alloy-js/java"
import { Child, Refkey } from "@alloy-js/core";
import { springFramework } from "../libraries/index.js";
import { HttpOperation, HttpOperationParameter, HttpProperty } from "@typespec/http";
import { TypeExpression } from "@typespec/emitter-framework/java";

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
  const path = <jv.Value value={op.uriTemplate}/>;
  
  const routeAnnotation = <SpringAnnotation annotationKind={route} annotationParameters={path}></SpringAnnotation>

  /**filters out parameter properties taken from a model type. If the parameter type is a model
   * then all the properties of that model will be present in parameters.properties.
  */
  const parameters = op.parameters.parameters;

  const parameterAnnotations = parameters.map(httpParam => ({
    parameter: httpParam,
    annotation: getParamAnnotation(httpParam),
  }));

  const body = op.parameters.body;
  const bodyAnnotationKind = body?.bodyKind == "single" ? "body" : "multipartBody";
  const bodyParamAnnotation = <SpringAnnotation annotationKind={bodyAnnotationKind}/>

  return {
    routeAnnotation,
    parameterAnnotations,
    body,
    bodyParamAnnotation
  };

}

function getParamAnnotation(parameter: HttpOperationParameter) {

  let annotationKind : string;
  let annotationParameters : string | undefined;

  switch (parameter.type) {
    case "header":
    case "query":
      annotationKind = parameter.type;
      annotationParameters = parameter.name;
      break;
    case "path":
      annotationKind = parameter.type;
      break;
  }

  return <SpringAnnotation annotationKind={annotationKind} annotationParameters={annotationParameters}/>
}
