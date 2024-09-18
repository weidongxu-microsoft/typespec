import { $ } from "@typespec/compiler/typekit";
import * as jv from "@alloy-js/java"
import {
  HeaderFieldOptions,
  HttpBody,
  HttpOperation, HttpOperationBody,
  PathParameterOptions,
  QueryParameterOptions,
} from "@typespec/http";
import { SpringAnnotation } from "./annotations.js";
import { TypeExpression } from "@typespec/emitter-framework/java";


export function SpringEndpointParameters(op: HttpOperation) {
  const bodyParams = op.parameters.body;
  const headerParams = $.httpRequest.getParameters(op, "header");
  const pathParams = $.httpRequest.getParameters(op,  "path");
  const queryParams = $.httpRequest.getParameters(op,  "query");

  const paramRecord: Record<string, string> = {};

  if (bodyParams && bodyParams.property) {
    const name = bodyParams.property?.name ?? "" ;
    const annotation = <SpringAnnotation annotationKind={"body"}/>;
    paramRecord[name] = <>{annotation} <TypeExpression type={bodyParams.property}/></>;
  }
  if (headerParams) {
    for (const headerParam of headerParams.properties.values()) {
      const options = $.modelProperty.getHttpParamOptions(headerParam) as HeaderFieldOptions;
      const optionValue = <jv.Value value={options.name}></jv.Value>;
      const annotation = <SpringAnnotation annotationKind={"header"} annotationParameters={optionValue}/>;
      paramRecord[headerParam.name] = <>{annotation} <TypeExpression type={headerParam}></TypeExpression></>;
    }
  }
  if (pathParams) {
    for (const pathParam of pathParams.properties.values()) {
      const options = $.modelProperty.getHttpParamOptions(pathParam) as PathParameterOptions;
      const optionValue = <jv.Value value={options.name}></jv.Value>;
      const annotation = <SpringAnnotation annotationKind={"path"} annotationParameters={optionValue}/>;
      paramRecord[pathParam.name] = <>{annotation} <TypeExpression type={pathParam}></TypeExpression></>;
    }
  }
  if (queryParams) {
    for (const queryParam of queryParams.properties.values()) {
      const options = $.modelProperty.getHttpParamOptions(queryParam) as QueryParameterOptions;
      const optionValue = <jv.Value value={options.name}></jv.Value>;
      const annotation = <SpringAnnotation annotationKind={"query"} annotationParameters={optionValue}/>;
      paramRecord[queryParam.name] = <>{annotation} <TypeExpression type={queryParam}></TypeExpression></>;
    }
  }
  return paramRecord;
}
