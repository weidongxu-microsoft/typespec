import { refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { EmitContext } from "@typespec/compiler";
import { getRoutePath, HttpOperation, OperationContainer } from "@typespec/http";
import { springFramework } from "../spring/libraries/index.js";

export interface OperationsGroup {
  container?: OperationContainer;
  operations: HttpOperation[];
}

/**
 * Emit route handlers for http operations. Takes an OperationsGroup
 *
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

        // TODO: Oncall RouteHandler that takes HttpOperation type. Can query everything off that to construct the route handler
        return (
          <jv.SourceFile path={nsOps.container?.name + "Controller.java"}>
            <jv.Annotation type={springFramework.RestController} />
            <jv.Annotation
              type={springFramework.RequestMapping}
              value={{ path: <jv.Value value={routePath} /> }}
            />
            <jv.Class public name={nsOps.container?.name + "Controller"}>
              <jv.Variable
                private
                type={refkey(`I${nsOps.container?.name}Service`)}
                name={serviceAccessor}
              />

              <jv.Annotation type={springFramework.Autowired} />
              <jv.Constructor
                public
                parameters={{
                  [serviceAccessor]: refkey(`I${nsOps.container?.name}Service`),
                }}
              >
                this.{serviceAccessor} = {serviceAccessor};
              </jv.Constructor>

              {nsOps.operations.map((op) => {
                return (
                  <>
                    <jv.Annotation type={springFramework.GetMapping} />
                    <jv.Method public return="String" name={op.operation?.name}>
                      return {serviceAccessor}.{op.operation?.name}();
                    </jv.Method>
                  </>
                );
              })}
            </jv.Class>
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
            <>
              <jv.SourceFile path={`I${nsOps.container?.name}Service.java`}>
                <jv.Interface public name={`I${nsOps.container?.name}Service`}>
                  {nsOps.operations.map((op) => {
                    // Figure out function input, and return return type of operation

                    return <jv.Method name={op.operation?.name} return="String" />;
                  })}
                </jv.Interface>
              </jv.SourceFile>
            </>
          );
        })}
      </jv.PackageDirectory>
    </>
  );
}
