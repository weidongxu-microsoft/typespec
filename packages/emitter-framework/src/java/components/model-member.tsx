import { Variable } from "@alloy-js/java";
import { ModelProperty } from "@typespec/compiler";
import { TypeExpression } from "./type-expression.js";

export interface ModelMemberProps {
  type: ModelProperty;
}

/**
 * Define member of model
 */
export function ModelMember({ type }: ModelMemberProps) {
  return <Variable private type={<TypeExpression type={type} />} name={type.name} />;
}
