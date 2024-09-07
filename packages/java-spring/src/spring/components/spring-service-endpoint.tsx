import {
  HttpOperation,
} from "@typespec/http";
import { httpDecoratorToSpringAnnotation } from "./utils.js";
import * as jv from "@alloy-js/java"
import { Child, Children } from "@alloy-js/core";
import { getSpringParameters } from "./spring-parameters.js";
import { TypeExpression } from "@typespec/emitter-framework/java";

export interface SpringServiceEndpointProps{
  httpOp: HttpOperation;
  children?: Children;
}

export function SpringServiceEndpoint({ httpOp, children }: SpringServiceEndpointProps) {

  const op = httpOp.operation;
  const path = httpOp.uriTemplate;
  const httpOpParams = httpOp.parameters;
  const properties = httpOpParams.properties;
  const emptyParams: Record<string, any> = {};

  const hasProperties = properties && properties.length > 0;
  const params: Record<string, any> = hasProperties ? (
    getSpringParameters(properties)
  ) : (
    emptyParams
  );

  const pathRecord : Record<string, Child> = {"" : path};

  const returnType = op.returnType;
  console.log(returnType);
  const returnTypeName = <TypeExpression type={returnType}/>;

  const route = httpDecoratorToSpringAnnotation.get(httpOp.verb);

  console.log(route);
  return(
    <>
      <jv.Annotation type={route} value={pathRecord}></jv.Annotation>
      <jv.Method name={op.name} return={returnTypeName} parameters={params} children={children}>
      </jv.Method>
      <>{`\n`}</>
    </>
  )
}





