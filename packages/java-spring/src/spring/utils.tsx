import { Generics } from "@alloy-js/java";
import { $ } from "@typespec/compiler";
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
  const responseModel = operation.responses[0].type;

  // console.log("Response Data For: " + operation.operation.name);
  // $.httpOperation.getResponses(operation.operation).forEach((response) => {
  //   console.log("Body: " + response.responseContent.body?.type?.kind);
  //   console.log("Response Status Code: " + response.statusCode);
  // });

  // If is emitting an in built type, usually is HTTP lib type like OkResponse, NotModified etc.
  // Those are in-built TypeSpec models and don't need to be emitted. For the sake of the response type
  // declaration, it will just be ResponseEntity<Void>, and implementing the specific response type will be
  // up to the user.
  if (!$.array.is(responseModel) && isNoEmit(responseModel)) {
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
