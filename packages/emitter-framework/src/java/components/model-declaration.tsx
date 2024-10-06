import { Children, refkey as getRefkey, mapJoin } from "@alloy-js/core";
import { Class, Generics, useJavaNamePolicy } from "@alloy-js/java";
import { getParentTemplateNode, Model, ModelProperty, Type } from "@typespec/compiler";
import { getTemplateParams } from "../utils.js";
import { Getter } from "./getter.js";
import { ModelConstructor } from "./model-constructor.js";
import { ModelMember } from "./model-member.js";
import { Setter } from "./setter.js";
import { join } from "path";
import { intrinsicNameToJavaType, TypeExpression } from "./type-expression.js";

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

  const genericArgs = baseModel ? baseModel.templateMapper?.args : [];
  const genericsString =
    (genericArgs?.length ?? 0) > 0 ? (
      <Generics types={genericArgs?.map((gen) => <TypeExpression type={gen as Type} />)} />
    ) : (
      ""
    );


  const baseModelExpression = baseModel ? baseModel.name : "";
  const extendsExpression = <>{baseModelExpression}{genericsString}</>;


  return (
    <Class
      public
      name={name}
      refkey={refkey}
      generics={generics?.length !== 0 ? genericObject : undefined}
      extends={baseModel ? extendsExpression : undefined}
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
