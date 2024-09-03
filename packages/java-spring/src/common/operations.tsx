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

        // TODO: Oncall RouteHandler that takes HttpOperation type. Can query everything off that to construct the route handler
        return (
          <jv.SourceFile path={nsOps.container?.name + "Controller.java"}>
            <jv.Annotation type={springFramework.RestController} />
            <jv.Annotation
              type={springFramework.RequestMapping}
              value={{ path: <jv.Value value={routePath} /> }}
            />
            <jv.Class public name={nsOps.container?.name + "Controller"}>
              {nsOps.operations.map((op) => {
                return (
                  <>
                    <jv.Annotation type={springFramework.GetMapping} />
                    <jv.Method public return="String" name={op.operation?.name}>
                      return "Hello, World!";
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
