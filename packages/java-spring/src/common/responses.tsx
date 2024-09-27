import { mapJoin, refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { useJavaNamePolicy } from "@alloy-js/java";
import { Model } from "@typespec/compiler";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { HttpOperation } from "@typespec/http";
import { isNoEmit } from "../emitter.js";

/**
 * Emit models used for custom response types
 *
 * @param ops Operations in the program
 */
export function emitResponseModels(ops: HttpOperation[]) {
  const customResponseOperations = ops.filter((op) => {
    return getNonErrorResponses(op).length > 1;
  });

  return mapJoin(customResponseOperations, (op) => {
    const nonErrorResponses = getNonErrorResponses(op);
    const customResponseName = getCustomResponseModelName(op);

    return (
      <jv.SourceFile path={customResponseName + ".java"}>
        <jv.Class public name={customResponseName}>
          {mapJoin(
            nonErrorResponses,
            (res) => {
              const responseModel = res.type as Model;
              const inBuiltResponse = isNoEmit(responseModel);

              return (
                <jv.Variable
                  private
                  type={
                    inBuiltResponse ? refkey("NoBody") : <TypeExpression type={responseModel} />
                  }
                  name={responseModel.name}
                />
              );
            },
            {
              joiner: "\n",
            },
          )}

          <jv.Constructor public />

          {mapJoin(
            nonErrorResponses,
            (res) => {
              const responseModel = res.type as Model;
              const inBuiltResponse = isNoEmit(responseModel);

              const returnType = inBuiltResponse ? (
                refkey("NoBody")
              ) : (
                <TypeExpression type={responseModel} />
              );
              const variableName = useJavaNamePolicy().getName(responseModel.name, "variable");

              return (
                <>
                  <jv.Method name={"get" + responseModel.name} public return={returnType}>
                    return this.{variableName};
                  </jv.Method>
                  <jv.Method
                    name={"set" + responseModel.name}
                    public
                    parameters={{
                      value: returnType,
                    }}
                  >
                    this.{variableName} = value;
                  </jv.Method>
                </>
              );
            },
            {
              joiner: "\n",
            },
          )}
        </jv.Class>
      </jv.SourceFile>
    );
  });
}

/**
 * Get responses for a {@link HttpOperation} that are not decorated with @error decorator
 *
 * @param op The Http Operation
 */
export function getNonErrorResponses(op: HttpOperation) {
  return op.responses.filter((res) => {
    const responseModel = res.type as Model;
    return !responseModel?.decorators?.some((decorator) => decorator.definition?.name === "@error");
  });
}

/**
 * Get responses for a {@link HttpOperation} that are decorated with @error decorator
 *
 * @param op The Http Operation
 */
export function getErrorResponses(op: HttpOperation) {
  return op.responses.filter((res) => {
    const responseModel = res.type as Model;
    return responseModel?.decorators?.some((decorator) => decorator.definition?.name === "@error");
  });
}

/**
 * Used to get the name when generating custom response models
 *
 * @param op The Http Operation
 */
export function getCustomResponseModelName(op: HttpOperation) {
  return op.operation.name.slice(0, 1).toUpperCase() + op.operation.name.slice(1) + "Response";
}
