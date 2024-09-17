import { $ } from "@typespec/compiler/typekit";
import * as jv from "@alloy-js/java"
import { HttpOperation } from "@typespec/http";
import { SpringAnnotation } from "./annotations.js";
import { TypeExpression } from "@typespec/emitter-framework/java";


export interface SpringServiceEndpointParametersProps {
  op: HttpOperation;
}

export function SpringEndpointParameters(op: HttpOperation) {
  const bodyParams = $.httpRequest.getBodyParameters(op);
  const headerParams = $.httpRequest.getParameters(op, "header");
  const pathParams = $.httpRequest.getParameters(op,  "path");

  const paramRecord: Record<string, string> = {};

  if (bodyParams) {
    for (const bodyParam of bodyParams.properties.values()) {
      console.log(bodyParam);
      paramRecord[bodyParam.name] = <><SpringAnnotation annotationKind={"body"}/> <TypeExpression type={bodyParam}></TypeExpression></>;
    }
  }
  if (headerParams) {
    for (const headerParam of headerParams.properties.values()) {
      paramRecord[headerParam.name] = <><SpringAnnotation annotationKind={"header"}/> <TypeExpression type={headerParam}></TypeExpression></>;
    }
  }
  if (pathParams) {
    for (const urlParam of pathParams.properties.values()) {
      paramRecord[urlParam.name] = <><SpringAnnotation annotationKind={"path"}/> <TypeExpression type={urlParam}></TypeExpression></>;
    }
  }
  return paramRecord;
}
