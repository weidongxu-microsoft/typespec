import { Children } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { HttpOperation } from "@typespec/http";
import { getResponseTypeExpression } from "../utils.js";
import { SpringRouteAnnotation } from "./route-annotations.js";
import { SpringEndpointParameters } from "./spring-service-endpoint-parameters.js";

export interface SpringServiceEndpointProps {
  op: HttpOperation;
  children?: Children;
}

export function SpringServiceEndpoint({ op, children }: SpringServiceEndpointProps) {
  const route = op.verb;
  const path = <jv.Value value={op.path} />;

  const routeAnnotation = (
    <SpringRouteAnnotation annotationKind={route} annotationParameters={path} />
  );

  const springParams = SpringEndpointParameters(op);
  return (
    <>
      {routeAnnotation}
      <jv.Method
        public
        name={op.operation.name}
        parameters={springParams}
        return={getResponseTypeExpression(op)}
      >
        {children}
      </jv.Method>
    </>
  );
}
