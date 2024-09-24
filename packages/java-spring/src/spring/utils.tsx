import { refkey } from "@alloy-js/core";
import { Generics } from "@alloy-js/java";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { HttpOperation } from "@typespec/http";
import { isNoEmit } from "../emitter.js";
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

  console.log(refkey(responseModel));

  // If is emitting an in built type, usually is HTTP lib type like OkResponse, NotModified etc.
  // Those are in-built TypeSpec models and don't need to be emitted. For the sake of the response type
  // declaration, it will just be ResponseEntity<Void>, and implementing the specific response type will be
  // up to the user.
  if (isNoEmit(responseModel)) {
    // prettier-ignore
    return (
     <>
       {springFramework.ResponseEntity}<Generics types={['Void']} />
     </>
    )
  }

  // prettier-ignore
  return (
    <>
      {springFramework.ResponseEntity}<Generics types={[<TypeExpression type={responseModel} />]} />
    </>
  );
}
