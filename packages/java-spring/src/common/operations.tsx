import { Child, mapJoin, refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { useJavaNamePolicy } from "@alloy-js/java";
import { $, EmitContext, ModelProperty } from "@typespec/compiler";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { getRoutePath, HttpOperation, OperationContainer } from "@typespec/http";
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

                  return (
                    <>
                      <SpringServiceEndpoint op={op}>
                        return {serviceAccessor}.{op.operation?.name}({paramNames.join(", ")});
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

                    const responseModel = op.responses[0].type;

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

                    return (
                      <jv.Method
                        name={op.operation?.name}
                        return={<TypeExpression type={responseModel} />}
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
