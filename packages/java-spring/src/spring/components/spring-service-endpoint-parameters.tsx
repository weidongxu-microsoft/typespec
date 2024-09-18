import * as jv from "@alloy-js/java";
import { $ } from "@typespec/compiler/typekit";
import { TypeExpression } from "@typespec/emitter-framework/java";
import {
  HeaderFieldOptions,
  HttpOperation,
  PathParameterOptions,
  QueryParameterOptions,
} from "@typespec/http";
import { SpringRouteAnnotation } from "./route-annotations.js";

export function SpringEndpointParameters(op: HttpOperation) {
  const bodyParams = op.parameters.body;
  const headerParams = $.httpRequest.getParameters(op, "header");
  const pathParams = $.httpRequest.getParameters(op, "path");
  const queryParams = $.httpRequest.getParameters(op, "query");

  const paramRecord: Record<string, string> = {};

  if (bodyParams && bodyParams.property) {
    const name = bodyParams.property?.name ?? "";
    const annotation = <SpringRouteAnnotation annotationKind={"body"} />;
    paramRecord[name] = (
      <>
        {annotation} <TypeExpression type={bodyParams.property} />
      </>
    );
  }
  if (headerParams) {
    for (const headerParam of headerParams.properties.values()) {
      const options = $.modelProperty.getHttpParamOptions(headerParam) as HeaderFieldOptions;
      const optionValue = <jv.Value value={options.name} />;
      const annotation = (
        <SpringRouteAnnotation annotationKind={"header"} annotationParameters={optionValue} />
      );
      paramRecord[headerParam.name] = (
        <>
          {annotation} <TypeExpression type={headerParam} />
        </>
      );
    }
  }
  if (pathParams) {
    for (const pathParam of pathParams.properties.values()) {
      const options = $.modelProperty.getHttpParamOptions(pathParam) as PathParameterOptions;
      const optionValue = <jv.Value value={options.name} />;
      const annotation = (
        <SpringRouteAnnotation annotationKind={"path"} annotationParameters={optionValue} />
      );
      paramRecord[pathParam.name] = (
        <>
          {annotation} <TypeExpression type={pathParam} />
        </>
      );
    }
  }
  if (queryParams) {
    for (const queryParam of queryParams.properties.values()) {
      const options = $.modelProperty.getHttpParamOptions(queryParam) as QueryParameterOptions;
      const optionValue = <jv.Value value={options.name} />;
      const annotation = (
        <SpringRouteAnnotation annotationKind={"query"} annotationParameters={optionValue} />
      );
      paramRecord[queryParam.name] = (
        <>
          {annotation} <TypeExpression type={queryParam} />
        </>
      );
    }
  }
  return paramRecord;
}
