import { mapJoin } from "@alloy-js/core";
import { Class, Constructor } from "@alloy-js/java";
import { Model } from "@typespec/compiler";
import {
  getModelClassName,
  getNameTypeRecordFromProperties,
  getTypePropertiesArray,
} from "../model-utils.js";
import { ModelConstructor } from "./model-constructor.js";
import { ModelMember } from "./model-member.js";

export interface ModelDeclarationProps {
  type: Model;
}

export function ModelDeclaration({ type }: ModelDeclarationProps) {
  const body = getBody(type);
  const name = getModelClassName(type);

  return <Class name={name}>{body}</Class>;
}

function modelParameterizedConstructor(type: Model) {
  const params = getNameTypeRecordFromProperties(type);
  return <ModelConstructor type={type} parameters={params} />;
}

function gettersAndSettersFromType(type: Model) {
  const typeMembers = getTypePropertiesArray(type);

  return mapJoin(
    typeMembers,
    (member) => <ModelMember type={member} memberGetAndSetMethod={true} />,
    { joiner: "\n" }
  );
}

function membersFromType(type: Model) {
  const typeMembers = getTypePropertiesArray(type);

  return mapJoin(
    typeMembers,
    (member) => <ModelMember type={member} memberGetAndSetMethod={false} />,
    { joiner: "\n" }
  );
}

//There may be a cleaner implementation but this gets the job done for now.
function getBody(type: Model) {
  const members = membersFromType(type);
  const gettersAndSetters = gettersAndSettersFromType(type);
  const parameterizedConstructor = modelParameterizedConstructor(type);
  const constructor = <Constructor public name={type.name}></Constructor>;

  return (
    <>
      {members}
      {`\n\n`}
      {constructor}
      {`\n\n`}
      {parameterizedConstructor}
      {`\n\n`}
      {gettersAndSetters}
    </>
  );
}
