import { Children, refkey as getRefkey, mapJoin } from "@alloy-js/core";
import { Class, useJavaNamePolicy } from "@alloy-js/java";
import { getParentTemplateNode, Model, ModelProperty } from "@typespec/compiler";
import { getTemplateParams } from "../utils.js";
import { Getter } from "./getter.js";
import { ModelConstructor } from "./model-constructor.js";
import { ModelMember } from "./model-member.js";
import { Setter } from "./setter.js";
import { join } from "path";

export interface ModelDeclarationProps {
  type: Model;
  propertyComponent?: (property: ModelProperty) => Children;
}

/**
 * Generate basic java class for a model
 */
export function ModelDeclaration({
  type,
  propertyComponent = (property) => <ModelMember type={property} />,
}: ModelDeclarationProps) {
  const namePolicy = useJavaNamePolicy();

  const properties = Array.from(type.properties.values());

  const name = namePolicy.getName(type.name, "class");
  const generics = type.node ? getTemplateParams(type.node) : undefined;
  const genericObject: Record<string, string> = {};
  generics?.forEach((generic) => (genericObject[generic] = ""));
  const refkey = getRefkey(type);

  const baseModel = type.baseModel;
  const templateArgs = type.templateMapper ? type.templateMapper?.args : [];

  if (baseModel && type.node) {
    const typeMapper = baseModel.templateArguments;


    console.log(type.name, typeMapper);

  }
  const extendsExpression = baseModel ? getRefkey(baseModel) : "";

  return (
    <Class
      public
      name={name}
      refkey={refkey}
      generics={generics?.length !== 0 ? genericObject : undefined}
      extends={extendsExpression}
    >
      {""}
      {mapJoin(
        properties,
        (property) => {
          return propertyComponent(property);
        },
        { joiner: "\n" }
      )}

      <ModelConstructor type={type} />

      {mapJoin(
        properties,
        (property) => {
          return (
            <>
              <Getter type={property} />

              <Setter type={property} />
            </>
          );
        },
        { joiner: "\n\n" }
      )}
      {""}
    </Class>
  );
}
