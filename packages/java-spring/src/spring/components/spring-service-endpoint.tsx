import { EmitContext, ignoreDiagnostics, Model, Operation } from "@typespec/compiler";
import { getHttpOperation, getOperationParameters, getPathParamName, getPathParamOptions } from "@typespec/http";
import { httpDecoratorToSpringAnnotation } from "./utils.js";
import * as jv from "@alloy-js/java"
import { Child } from "@alloy-js/core";
import { getSpringParameters } from "./spring-parameters.js";
import { TypeExpression } from "@typespec/emitter-framework/java";

export interface SpringServiceEndpointProps{
  op: Operation;
  context: EmitContext;
}

export function SpringServiceEndpoint({ op, context }: SpringServiceEndpointProps) {

  const httpOp = ignoreDiagnostics(getHttpOperation(context.program, op));
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
      <jv.Method name={op.name} return={returnTypeName} parameters={params}>
        throw new UnsupportedOperationException("Not implemented");
      </jv.Method>
      <>{`\n`}</>
    </>
  )
}





