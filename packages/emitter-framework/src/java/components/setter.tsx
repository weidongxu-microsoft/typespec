import * as jv from "@alloy-js/java";
import { ModelProperty } from "@typespec/compiler";
import { TypeExpression } from "./type-expression.js";

export interface SetterProps {
  type: ModelProperty;
}

/**
 * Generate setter for a model member
 */
export function Setter(props: SetterProps) {
  const accessName = props.type.name.charAt(0).toUpperCase() + props.type.name.slice(1);

  return (
    <jv.Method
      name={"set" + accessName}
      public
      parameters={{ [props.type.name]: <TypeExpression type={props.type} /> }}
    >
      this.{props.type.name} = {props.type.name};
    </jv.Method>
  );
}
