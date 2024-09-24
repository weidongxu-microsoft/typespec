import { Generics } from "@alloy-js/java";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { HttpOperation } from "@typespec/http";
import { springFramework } from "./libraries/index.js";

/**
 * Declare the java return type for the operation, based on the Http response type
 *
 * @param operation The operation to get the response type expression for
 */
export function getResponseTypeExpression(operation: HttpOperation) {
  console.log("Responses for: " + operation.operation.name);
  operation.responses.forEach((response) => {
    console.log("Response Type: ", response.type.kind);
  });

  const responseModel = operation.responses[0].type;
  // prettier-ignore
  return (
    <>
      {springFramework.ResponseEntity}<Generics types={[<TypeExpression type={responseModel} />]} />
    </>
  );
}
