import { mapJoin } from "@alloy-js/core";
import { Constructor, ConstructorProps } from "@alloy-js/java";
import { ModelProperty } from "@typespec/compiler";
import { getTypePropertiesArray } from "../model-utils.js";
import { ConstructorMember } from "./constructor-member.js";
import { ModelDeclarationProps } from "./model-declaration.js";

export interface ModelConstructorProps extends ModelDeclarationProps, ConstructorProps {}

export function ModelConstructor(props: ModelConstructorProps) {
  const properties = getTypePropertiesArray(props.type);
  const params = props.parameters;
  const members = properties ? constructorMembersMapJoin(properties) : undefined;

  return (
    <Constructor parameters={params} public name={props.type.name}>
      {members ? members : ""}
    </Constructor>
  );
}

function constructorMembersMapJoin(properties: ModelProperty[]) {
  return mapJoin(Array.from(properties), (property) => <ConstructorMember type={property} />, {
    joiner: "\n",
  });
}
