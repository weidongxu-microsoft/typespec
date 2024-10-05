import { Children, refkey as getRefkey, mapJoin } from "@alloy-js/core";
import { Class, Constructor, useJavaNamePolicy } from "@alloy-js/java";
import { Model, ModelProperty } from "@typespec/compiler";
import { getTemplateParams } from "../utils.js";
import { Getter } from "./getter.js";
import { ModelConstructor } from "./model-constructor.js";
import { ModelMember } from "./model-member.js";
import { Setter } from "./setter.js";

export interface ModelDeclarationProps {
  type: Model;
  propertyComponent?: (property: ModelProperty) => Children;
}

/**
 * Generate basic java class for a model
 * TODO: Handle extending other models
 */
export function ModelDeclaration({
  type,
  propertyComponent = (property) => <ModelMember type={property} />,
}: ModelDeclarationProps) {
  const namePolicy = useJavaNamePolicy();

  const properties = Array.from(type.properties.values()).filter((p) => {
    return !p.decorators?.some((d) => d.definition?.name === "@statusCode");
  });

  const name = namePolicy.getName(type.name, "class");
  const generics = type.node ? getTemplateParams(type.node) : undefined;
  const genericObject: Record<string, string> = {};
  generics?.forEach((generic) => (genericObject[generic] = ""));
  const refkey = getRefkey(type);

  const isErrorModel = type.decorators?.some((d) => d.definition?.name === "@error");

  return (
    <Class
      public
      name={name}
      refkey={refkey}
      generics={generics?.length !== 0 ? genericObject : undefined}
      extends={isErrorModel ? "Exception" : undefined}
    >
      {""}
      {mapJoin(
        properties,
        (property) => {
          return propertyComponent(property);
        },
        { joiner: "\n" },
      )}

      {properties.length !== 0 && <Constructor public />}

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
        { joiner: "\n\n" },
      )}
      {""}
    </Class>
  );
}
