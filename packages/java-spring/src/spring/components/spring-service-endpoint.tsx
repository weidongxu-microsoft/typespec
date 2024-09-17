import {
  HttpOperation,
} from "@typespec/http";
import * as jv from "@alloy-js/java"
import { Children } from "@alloy-js/core";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { collectAnnotations, SpringAnnotations } from "./annotations.js";
import { $ } from "@typespec/compiler/typekit";
import { SpringEndpointParameters } from "./spring-service-endpoint-parameters.js";
export interface SpringServiceEndpointProps{
  op: HttpOperation;
  children?: Children;
}

export function SpringServiceEndpoint({ op, children }: SpringServiceEndpointProps) {

  const annotations = collectAnnotations(op);

  const parameters = $.httpRequest.getParameters(op, ["path", "query", "header", "contentType"]);
  if (parameters && parameters.properties) {
    //console.log(parameters.properties.values());
  }
  const paramRecord: Record<string, string> = {};

  for (const param of annotations.parameterAnnotations) {

    const property = param.parameter.param;
    const paramName = param.parameter.name;
    const paramType = <TypeExpression type={property}></TypeExpression>

    paramRecord[paramName] = <>{param.annotation} {paramType}</>;
  }

  if (annotations.body && annotations.body.property) {
    const bodyType = <TypeExpression type={annotations.body.property}></TypeExpression>
    paramRecord[annotations.body.property?.name] = <>{annotations.bodyParamAnnotation} {bodyType}</>
  }

  const springParams = SpringEndpointParameters(op);
  return(
    <>
      <>{annotations.routeAnnotation}</>
      <jv.Method name={op.operation.name} parameters={springParams} children={children}>
      </jv.Method>
      <>{`\n`}</>
    </>
  )
}





