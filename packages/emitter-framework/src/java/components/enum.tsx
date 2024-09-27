import { Enum } from "@typespec/compiler";
import * as jv from  "@alloy-js/java"
import { mapJoin } from "@alloy-js/core";


export interface EnumProps {
  type: Enum;
}

export function EnumDeclaration({ type }: EnumProps) {

  const members = Array.from(type.members.values());
  const joinedMembers = mapJoin(members, (member) => {
    return <jv.EnumMember name={member.name}></jv.EnumMember>
  }, { joiner: ",\n" });

  return <jv.Enum name={type.name}>
    {joinedMembers}
  </jv.Enum>
}
