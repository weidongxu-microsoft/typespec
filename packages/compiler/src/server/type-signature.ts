import { getSymNode } from "../core/binder.js";
import { compilerAssert } from "../core/diagnostics.js";
import { printIdentifier } from "../core/helpers/syntax-utils.js";
import { getEntityName, getTypeName, isStdNamespace } from "../core/helpers/type-name-utils.js";
import type { Program } from "../core/program.js";
import { getFullyQualifiedSymbolName } from "../core/type-utils.js";
import {
  AliasStatementNode,
  Decorator,
  EnumMember,
  FunctionParameter,
  ModelProperty,
  Operation,
  StringTemplate,
  Sym,
  SyntaxKind,
  Type,
  UnionVariant,
  Value,
} from "../core/types.js";

/** @internal */
export function getSymbolSignature(program: Program, sym: Sym): string {
  const decl = getSymNode(sym);
  switch (decl?.kind) {
    case SyntaxKind.AliasStatement:
      return fence(`alias ${getAliasSignature(decl)}`);
  }
  const entity = sym.type ?? program.checker.getTypeOrValueForNode(decl);
  return getEntitySignature(sym, entity);
}

function getEntitySignature(sym: Sym, entity: Type | Value | null): string {
  if (entity === null) {
    return "(error)";
  }
  if ("valueKind" in entity) {
    return fence(`const ${sym.name}: ${getTypeName(entity.type)}`);
  }

  return getTypeSignature(entity);
}

function getTypeSignature(type: Type): string {
  switch (type.kind) {
    case "Scalar":
    case "Enum":
    case "Union":
    case "Interface":
    case "Model":
    case "Namespace":
      return fence(`${type.kind.toLowerCase()} ${getPrintableTypeName(type)}`);
    case "ScalarConstructor":
      return fence(`init ${getTypeSignature(type.scalar)}.${type.name}`);
    case "Decorator":
      return fence(getDecoratorSignature(type));
    case "Operation":
      return fence(getOperationSignature(type));
    case "String":
      // BUG: https://github.com/microsoft/typespec/issues/1350 - should escape string literal values
      return `(string)\n${fence(`"${type.value}"`)}`;
    case "Boolean":
      return `(boolean)\n${fence(type.value ? "true" : "false")}`;
    case "Number":
      return `(number)\n${fence(type.value.toString())}`;
    case "StringTemplate":
      return `(string template)\n${fence(getStringTemplateSignature(type))}`;
    case "StringTemplateSpan":
      return `(string template span)\n${fence(getTypeName(type.type))}`;
    case "Intrinsic":
      return "";
    case "FunctionParameter":
      return `(function parameter)\n${fence(getFunctionParameterSignature(type))}`;
    case "ModelProperty":
      return `(model property)\n${fence(getModelPropertySignature(type))}`;
    case "EnumMember":
      return `(enum member)\n${fence(getEnumMemberSignature(type))}`;
    case "TemplateParameter":
      return `(template parameter)\n${fence(type.node.id.sv)}`;
    case "UnionVariant":
      return `(union variant)\n${fence(getUnionVariantSignature(type))}`;
    case "Tuple":
      return `(tuple)\n[${fence(type.values.map(getTypeSignature).join(", "))}]`;
    default:
      const _assertNever: never = type;
      compilerAssert(false, "Unexpected type kind");
  }
}

function getDecoratorSignature(type: Decorator) {
  const ns = getQualifier(type.namespace);
  const name = type.name.slice(1);
  const parameters = [type.target, ...type.parameters].map((x) => getFunctionParameterSignature(x));
  return `dec ${ns}${name}(${parameters.join(", ")})`;
}

function getOperationSignature(type: Operation) {
  const parameters = [...type.parameters.properties.values()].map(getModelPropertySignature);
  return `op ${getTypeName(type)}(${parameters.join(", ")}): ${getPrintableTypeName(type.returnType)}`;
}

function getFunctionParameterSignature(parameter: FunctionParameter) {
  const rest = parameter.rest ? "..." : "";
  const optional = parameter.optional ? "?" : "";
  return `${rest}${printIdentifier(parameter.name, "allow-reserved")}${optional}: ${getEntityName(parameter.type)}`;
}

function getStringTemplateSignature(stringTemplate: StringTemplate) {
  return (
    "`" +
    [
      stringTemplate.spans.map((span) => {
        return span.isInterpolated ? "${" + getTypeName(span.type) + "}" : span.type.value;
      }),
    ].join("") +
    "`"
  );
}

function getModelPropertySignature(property: ModelProperty) {
  const ns = getQualifier(property.model);
  return `${ns}${printIdentifier(property.name, "allow-reserved")}: ${getPrintableTypeName(property.type)}`;
}

function getUnionVariantSignature(variant: UnionVariant) {
  if (typeof variant.name !== "string") {
    return getPrintableTypeName(variant.type);
  }
  const ns = getQualifier(variant.union);
  return `${ns}${printIdentifier(variant.name, "allow-reserved")}: ${getPrintableTypeName(variant.type)}`;
}

function getEnumMemberSignature(member: EnumMember) {
  const ns = getQualifier(member.enum);
  const value = typeof member.value === "string" ? `"${member.value}"` : member.value;
  return value === undefined
    ? `${ns}${printIdentifier(member.name, "allow-reserved")}`
    : `${ns}${printIdentifier(member.name, "allow-reserved")}: ${value}`;
}

function getAliasSignature(alias: AliasStatementNode) {
  const fullName = getFullyQualifiedSymbolName(alias.symbol);
  const args = alias.templateParameters.map((t) => t.id.sv);
  return args.length === 0 ? fullName : `${fullName}<${args.join(", ")}>`;
}

function getQualifier(parent: (Type & { name?: string | symbol }) | undefined) {
  if (
    !parent?.name ||
    typeof parent.name !== "string" ||
    (parent.kind === "Namespace" && isStdNamespace(parent))
  ) {
    return "";
  }

  const parentName = getPrintableTypeName(parent);
  if (!parentName) {
    return "";
  }

  return parentName + ".";
}

function getPrintableTypeName(type: Type) {
  return getTypeName(type, {
    printable: true,
  });
}

function fence(code: string) {
  return `\`\`\`typespec\n${code}\n\`\`\``;
}
