import { Child, code, mapJoin, refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { useJavaNamePolicy } from "@alloy-js/java";
import { $, EmitContext, ModelProperty } from "@typespec/compiler";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { getRoutePath, HttpOperation, OperationContainer } from "@typespec/http";
import { FlatHttpResponse } from "@typespec/http/typekit";
import { RestController } from "../spring/components/index.js";
import { SpringServiceEndpoint } from "../spring/components/spring-service-endpoint.js";
import { springFramework } from "../spring/libraries/index.js";

export interface OperationsGroup {
  container?: OperationContainer;
  operations: HttpOperation[];
}

/**
 * Emit route handlers for http operations. Takes an OperationsGroup
 *
 * @param context Emit context
 * @param ops List of http operations
 */
export function emitOperations(context: EmitContext, ops: Record<string, OperationsGroup>) {
  return (
    <>
      {Object.values(ops).map((nsOps) => {
        if (nsOps.container === undefined) return null;

        // Get route decorator on container
        const routePath = getRoutePath(context.program, nsOps.container)?.path;

        const serviceAccessor = nsOps.container?.name.toLowerCase() + "Service";

        return (
          <jv.SourceFile path={`${nsOps.container?.name}Controller.java`}>
            <RestController container={nsOps.container}>
              <jv.Variable
                private
                final
                type={refkey(`${nsOps.container?.name}Service`)}
                name={serviceAccessor}
              />

              <jv.Annotation type={springFramework.Autowired} />
              <jv.Constructor
                public
                parameters={{
                  [serviceAccessor]: refkey(`${nsOps.container?.name}Service`),
                }}
              >
                this.{serviceAccessor} = {serviceAccessor};
              </jv.Constructor>

              {mapJoin(
                nsOps.operations,
                (op) => {
                  // Build names for params, to pass to service call
                  const bodyParams = op.parameters.body;
                  const headerParams = $.httpRequest.getParameters(op, "header");
                  const pathParams = $.httpRequest.getParameters(op, "path");
                  const queryParams = $.httpRequest.getParameters(op, "query");

                  const paramNames: string[] = [];

                  // Request body
                  if (bodyParams && bodyParams.property) {
                    paramNames.push(bodyParams.property.name);
                  }

                  if (headerParams) {
                    for (const prop of headerParams.properties.values()) {
                      paramNames.push(prop.name);
                    }
                  }

                  if (pathParams) {
                    for (const prop of pathParams.properties.values()) {
                      paramNames.push(prop.name);
                    }
                  }

                  if (queryParams) {
                    for (const prop of queryParams.properties.values()) {
                      paramNames.push(prop.name);
                    }
                  }

                  // Declare body of endpoint method depending on the following scenarios.
                  // 1. Response body is defined and one status code provided
                  // - Returns a ResponseEntity wrapping body object and this single status code
                  // 2. Response body is undefined and one status code provided
                  // - Returns a ResponseEntity with no body and this single status code
                  // 3. The above two cases (body or no body) but with multiple status codes
                  // - Generate custom java class with a property for each of the status codes. The
                  // - types of the property will be either the body type if defined, or void.
                  // - The business logic interface will return this custom object
                  // - with one of the properties set relevant to the status code to be returned.
                  // - This endpoint will then detect which is set, and send that status code with the
                  // - relevant body.

                  // If any of the response models has @error decorator, wrap method in try-catch block
                  // and in catch block return ResponseEntity wrapping the error model as body, and status code of error model

                  // TODO: Currently takes first response as the basis for the @body type
                  const response: FlatHttpResponse = $.httpOperation.getResponses(op.operation)[0];

                  // Takes status codes from all responses, this could happen from for instance e.g MyDataModel | CreatedResponse, emits status codes 200 & 201
                  // or MyDataModel & CreatedResponse only emits status code 201

                  // TODO: Get error model type and specify throws clause on method

                  // TODO: Currently only getting the first status code out even if there are multiple
                  const statusCode = response.statusCode;

                  const responseBodyType = response.responseContent.body?.type;

                  return (
                    <>
                      <SpringServiceEndpoint op={op}>
                        {responseBodyType != null
                          ? code`
                          ${(<TypeExpression type={responseBodyType} />)} returnedBody = ${serviceAccessor}.${op.operation?.name}(${paramNames.join(", ")});
                          return new ${springFramework.ResponseEntity}${(<jv.Generics />)}(returnedBody, ${springFramework.HttpStatus}.valueOf(${statusCode as number}));
                        `
                          : code`
                          ${serviceAccessor}.${op.operation?.name}(${paramNames.join(", ")});
                          return new ${springFramework.ResponseEntity}${(<jv.Generics />)}(${springFramework.HttpStatus}.valueOf(${statusCode as number}));
                        `}
                      </SpringServiceEndpoint>
                    </>
                  );
                },
                { joiner: "\n\n" }
              )}
            </RestController>
          </jv.SourceFile>
        );
      })}
    </>
  );
}

/**
 * Emit services to implement business logic. Will generate interface, then class to be implemented by user
 *
 * @param context Emit context
 * @param ops List of http operations
 */
export function emitServices(context: EmitContext, ops: Record<string, OperationsGroup>) {
  return (
    <>
      <jv.PackageDirectory package="services">
        {Object.values(ops).map((nsOps) => {
          if (nsOps.container === undefined) return null;

          return (
            <jv.SourceFile path={`${nsOps.container?.name}Service.java`}>
              <jv.Interface public name={`${nsOps.container?.name}Service`}>
                {mapJoin(
                  nsOps.operations,
                  (op) => {
                    // Generated function will take parameters that are passed to endpoint (combination of query, body, path variable etc)
                    // Return type will be return type of operation
                    const namePolicy = useJavaNamePolicy();

                    const bodyParams = op.parameters.body;
                    const headerParams = $.httpRequest.getParameters(op, "header");
                    const pathParams = $.httpRequest.getParameters(op, "path");
                    const queryParams = $.httpRequest.getParameters(op, "query");

                    // Parameters (query, path, and headers)
                    const params: Record<string, Child> = {};

                    // Request body
                    if (bodyParams && bodyParams.property) {
                      params[bodyParams?.property?.name ?? "body"] = (
                        <TypeExpression type={bodyParams.property} />
                      );
                    }

                    const modelProperties: ModelProperty[] = [];

                    if (headerParams) {
                      for (const prop of headerParams.properties.values()) {
                        modelProperties.push(prop);
                      }
                    }

                    if (pathParams) {
                      for (const prop of pathParams.properties.values()) {
                        modelProperties.push(prop);
                      }
                    }

                    if (queryParams) {
                      for (const prop of queryParams.properties.values()) {
                        modelProperties.push(prop);
                      }
                    }

                    modelProperties.forEach((param) => {
                      params[namePolicy.getName(param.name, "parameter")] = (
                        <TypeExpression type={param} />
                      );
                    });

                    // Determine return type of the business logic interface
                    // - If single status code and body, return type is Model
                    // - If multiple status codes, returns custom object that has a property for each of the
                    //   codes, type of property is body Model (or Void if no body)
                    // - If error model part of response, add `throws <CustomError>` clause
                    //   to specify the error that should be thrown if any

                    // TODO: For now assuming one response type
                    // TODO: Combine multiple status codes and create custom object
                    const response: FlatHttpResponse = $.httpOperation.getResponses(
                      op.operation
                    )[0];

                    // TODO: Get error model type and specify throws clause on method

                    const responseBodyType = response.responseContent.body?.type;

                    // // Get responses
                    // $.httpOperation.getResponses(op.operation).forEach((response) => {
                    //   const model = response.responseContent.body?.type as Model;
                    //   console.log("Body:", model?.name);
                    //   console.log("Response Status Code: " + response.statusCode);
                    //   model?.decorators?.forEach((decorator) => {
                    //     // console.log("Decorator:", decorator);
                    //     console.log("Deco Name", decorator.definition?.name);
                    //     // decorator.args?.forEach((arg) => {
                    //     //   console.log("Arg:", arg.value);
                    //     // });
                    //   });
                    //   console.log("End Responses");
                    // });

                    return (
                      <jv.Method
                        name={op.operation?.name}
                        // Interface will usually always return the type of our body, and void if body is undefined
                        return={
                          responseBodyType ? <TypeExpression type={responseBodyType} /> : undefined
                        }
                        parameters={params}
                      />
                    );
                  },
                  { joiner: "\n" }
                )}
              </jv.Interface>
            </jv.SourceFile>
          );
        })}
      </jv.PackageDirectory>
    </>
  );
}
