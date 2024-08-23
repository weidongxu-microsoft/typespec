import { ModelProperty } from "@typespec/compiler";


export interface ConstructorMemberProps {
  type: ModelProperty;
}

export function ConstructorMember({type} : ConstructorMemberProps) {
  return<>this.{type.name} = {type.name};</>
}
