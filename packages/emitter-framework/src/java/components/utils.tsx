import { ModelProperty, Type } from "@typespec/compiler";
import { TypeExpression } from "./type-expression.js";

export function getTypeExpression(type: Type) {
  return(
    <TypeExpression type={type}></TypeExpression>
  )
}

export function getJavaTypeFromModelProperty(type: ModelProperty) {
  const typeReference = (type);
  console.log(`type ref ${type.name}: ${typeReference}`);
  return typeReference !== undefined
    ? typeReference
    : <TypeExpression type={type.type}></TypeExpression>;
}
