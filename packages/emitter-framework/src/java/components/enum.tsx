import { Enum } from "@typespec/compiler";
import * as jv from  "@alloy-js/java"
import { mapJoin } from "@alloy-js/core";
import { TypeExpression } from "../../typescript/index.js";


export interface EnumProps {
  type: Enum;
}

export function EnumDeclaration({ type }: EnumProps) {

  const members = Array.from(type.members.values());

  let valueType: string | undefined;
  let isConsistent = true;


  members.forEach((member, index) => {
    if (member.value !== undefined && member.value !== null) {
      const currentType = typeof member.value === "string" ? "String" : "int";

      if (valueType === undefined) {
        valueType = currentType;
      }
      else if (valueType !== currentType) {
        isConsistent = false;
      }
    }
  });

  if (!isConsistent) {
    throw new Error("All enum values must have the same type");
  }

  let constructor = null;
  let variable = null;
  if (valueType) {
    variable = <jv.Variable type={valueType} name="value" private={true}/>;
    constructor = <jv.Constructor name={type.name} parameters={{value: valueType}} private>
        this.value = value;
      </jv.Constructor>;
  }

  const joinedMembers = mapJoin(members, (member) => {
    let value;
    if (valueType) {
       value = member.value ? <jv.Value value={member.value}/> : "null";
    } else {
      value = "";
    }
    return <jv.EnumMember name={member.name} arguments={value}/>
  }, { joiner: ",\n" });



  return valueType ? <jv.Enum name={type.name}>
    {joinedMembers};

    {variable}
    {constructor}
  </jv.Enum> : <jv.Enum name={type.name}>
    {joinedMembers}
  </jv.Enum>
}
