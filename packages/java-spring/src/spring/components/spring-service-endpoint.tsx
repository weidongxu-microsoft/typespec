import { Children } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { HttpOperation } from "@typespec/http";
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

  const responseModel = op.responses[0].type;

  const springParams = SpringEndpointParameters(op);
  return (
    <>
      {routeAnnotation}
      <jv.Method
        public
        name={op.operation.name}
        parameters={springParams}
        return={<TypeExpression type={responseModel} />}
      >
        {children}
      </jv.Method>
    </>
  );
}
