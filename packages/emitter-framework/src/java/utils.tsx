import { getParentTemplateNode, ModelProperty, ModelPropertyNode, Node } from "@typespec/compiler";

export function getTemplateParams(node: Node): string[] {
  const parentTemplateNode = node ? getParentTemplateNode(node) : undefined;
  if (parentTemplateNode) {
    const templateGenericsArray = Array.from(parentTemplateNode.locals?.entries() || []);
    return templateGenericsArray.map(([_, value]) => value.name);
  }
  return [];
}
export function getScalarValueSv(type: ModelProperty) {
  const node = type.node.kind === 15 ? (type.node as ModelPropertyNode) : undefined;
  const valueNode = node ? node.value : undefined;
  if (valueNode) {
    const target = "target" in valueNode ? valueNode.target : undefined;
    if (target) {
      return "sv" in target ? target.sv : undefined;
    }
  }
  return undefined;
}
