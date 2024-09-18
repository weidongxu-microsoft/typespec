import {
  HttpOperation,
} from "@typespec/http";
import * as jv from "@alloy-js/java"
import { Children } from "@alloy-js/core";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { SpringAnnotation, SpringAnnotations } from "./annotations.js";
import { $ } from "@typespec/compiler/typekit";
import { SpringEndpointParameters } from "./spring-service-endpoint-parameters.js";
export interface SpringServiceEndpointProps{
  op: HttpOperation;
  children?: Children;
}

export function SpringServiceEndpoint({ op, children }: SpringServiceEndpointProps) {

  const route = op.verb;
  const path = <jv.Value value={op.uriTemplate}/>;

  const routeAnnotation = <SpringAnnotation annotationKind={route} annotationParameters={path}></SpringAnnotation>

  const springParams = SpringEndpointParameters(op);
  return(
    <>
      <>{routeAnnotation}</>
      <jv.Method name={op.operation.name} parameters={springParams} children={children}>
      </jv.Method>
      <>{`\n`}</>
    </>
  )
}





