import {
  HttpOperation,
} from "@typespec/http";
import * as jv from "@alloy-js/java"
import { Children } from "@alloy-js/core";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { collectAnnotations, SpringAnnotations } from "./annotations.js";

export interface SpringServiceEndpointProps{
  op: HttpOperation;
  children?: Children;
}

export function SpringServiceEndpoint({ op, children }: SpringServiceEndpointProps) {
  const annotations = collectAnnotations(op);

  const paramRecord: Record<string, string> = {};


  for (const param of annotations.parameterAnnotations) {

    const property = param.property.property;
    const paramName = property.name;
    const paramType = <TypeExpression type={property}></TypeExpression>

    paramRecord[paramName] = <>{param.annotation} {paramType}</>;
  }

  return(
    <>
      <>{annotations.routeAnnotation}</>
      <jv.Method name={op.operation.name} parameters={paramRecord} children={children}>
      </jv.Method>
      <>{`\n`}</>
    </>
  )
}





