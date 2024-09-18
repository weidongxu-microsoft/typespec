import {
  HttpOperation,
} from "@typespec/http";
import * as jv from "@alloy-js/java"
import { Children } from "@alloy-js/core";
import { SpringRouteAnnotation} from "./route-annotations.js";
import { SpringEndpointParameters } from "./spring-service-endpoint-parameters.js";
export interface SpringServiceEndpointProps{
  op: HttpOperation;
  children?: Children;
}

export function SpringServiceEndpoint({ op, children }: SpringServiceEndpointProps) {

  const route = op.verb;
  const path = <jv.Value value={op.uriTemplate}/>;

  const routeAnnotation = <SpringRouteAnnotation annotationKind={route} annotationParameters={path}/>

  const springParams = SpringEndpointParameters(op);
  return(
    <>
      <>{routeAnnotation}</>
      <jv.Method name={op.operation.name} parameters={springParams}>
        {children}
      </jv.Method>
      <>{`\n`}</>
    </>
  )
}





