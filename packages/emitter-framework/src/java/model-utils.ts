import {
  getParentTemplateNode,
  getTypeName,
  Model,
  ModelProperty, ModelPropertyNode,
  Node,
} from "@typespec/compiler";
import {  getTypeExpression } from "./components/index.js";



export function getModelClassName(type: Model) {
  const className = type.name;
  const templateParams = type.node ? getTemplateParams(type.node) : [];
  return templateParams.length ? `${className}<${templateParams.join(', ')}>` : className;
}

export function getTemplateParams(node: Node): string[] {
  const parentTemplateNode = node? getParentTemplateNode(node) : undefined;
  if (parentTemplateNode) {
    const templateGenericsArray = Array.from(parentTemplateNode.locals?.entries() || []);
    return templateGenericsArray.map(([_, value]) => value.name);
  }
  return [];
}

export function getModelName(type: Model) {
  const fullModelName = getTypeName(type);
  const nameParts = fullModelName.split('.');
  return nameParts[nameParts.length - 1];
}

export function getNameTypeRecordFromProperties(type: Model) {
  const propertiesArray = getTypePropertiesArray(type);
  const result: Record<string, string> = {};

  propertiesArray.forEach(property => {
    result[property.name] = getTypeExpression(property);
  });
  return result;
}

export function getTypePropertiesArray(type: Model) {
  const properties = type.properties.values();
  return Array.from(properties);
}

export function getScalarValueSv(type: ModelProperty) {
  const node = type.node.kind == 15 ? type.node as ModelPropertyNode: undefined;
  const valueNode = node? node.value : undefined;
  if (valueNode) {
    const target = "target" in valueNode ? valueNode.target : undefined;
    if (target) {
      return "sv" in target ? target.sv : undefined;
    }
  }
  return undefined;
}






