import { Method, Variable } from "@alloy-js/java";
import { ModelProperty } from "@typespec/compiler";
import { TypeExpression } from "./type-expression.js";

export interface ModelMemberProps {
  type: ModelProperty;
  memberGetAndSetMethod: boolean;
}

export function ModelMember({ type, memberGetAndSetMethod }: ModelMemberProps) {
  //todo: Fix naming, Method component does not correctly set the name to camelCase for some reason.
  if (memberGetAndSetMethod) {
    const returnType = <TypeExpression type={type}></TypeExpression>;
    const setParams: Record<string, string> = { [type.name]: returnType };
    const getter = (
      <Method name={"get" + type.name} return={returnType} public>{`return ${type.name};`}</Method>
    );
    const setter = (
      <Method
        name={"set" + type.name}
        return={returnType}
        public
        parameters={setParams}
      >{`this.${type.name} = ${type.name};`}</Method>
    );
    return (
      <>
        {getter}
        {`\n\n`}
        {setter}
        {`\n`}
      </>
    );
  }

  const javaType = <TypeExpression type={type} />;

  return <Variable type={javaType} name={type.name} private></Variable>;
}
