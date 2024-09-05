import { code, refkey } from "@alloy-js/core";
import { Generics, Reference, Value } from "@alloy-js/java";
import { IntrinsicType, Model, ModelPropertyNode, Scalar, Type } from "@typespec/compiler";
import { isArray, isDeclaration } from "../../core/index.js";
import { getScalarValueSv } from "../utils.js";

export interface TypeExpressionProps {
  type: Type;
}

export function TypeExpression({ type }: TypeExpressionProps) {
  if (isDeclaration(type) && !(type as Model).indexer) {
    // todo: probably need abstraction around deciding what's a declaration in the output
    // (it may not correspond to things which are declarations in TypeSpec?)
    return <Reference refkey={refkey(type)} />;
  }

  switch (type.kind) {
    case "Scalar":
    case "Intrinsic":
      return <>{getScalarIntrinsicExpression(type)}</>;
    case "Boolean":
    case "Number":
    case "String":
      return <Value value={type.value} />;
    case "Union":
      return "TODO";
    case "EnumMember":
      return (
        <>
          {type.enum.name}.{type.name}
        </>
      );
    case "ModelProperty":
      const sv = getScalarValueSv(type);

      if (sv) {
        return intrinsicNameToJavaType.get(sv) ? intrinsicNameToJavaType.get(sv) : sv;
      }

      if (isArray(type.type)) {
        return code`${(<TypeExpression type={type.type.indexer.value} />)}[]`;
      }

      // @ts-expect-error wip code
      const scalarValue = (type?.node as ModelPropertyNode)?.value?.arguments?.[0]?.argument?.target
        ?.sv;
      const genericSv = scalarValue ? intrinsicNameToJavaType.get(scalarValue) : null;

      const genericsString = genericSv ? <Generics types={[genericSv]} /> : "";

      return code`${refkey(type.type)}${genericsString}`;
    // return <TypeExpression type={type.type} />;
    case "Model":
      if (isArray(type)) {
        return code`${(<TypeExpression type={type.indexer.value} />)}[]`;
      }

      return refkey(type);

    default:
      throw new Error(type.kind + " not supported in TypeExpression");
  }
}
const intrinsicNameToJavaType = new Map<string, string>([
  ["unknown", "Object"], // Java does not have an equivalent for "unknown"
  ["string", "String"],
  ["int32", "Integer"],
  ["int16", "short"],
  ["float16", "float"], // Java does not have float16, using float
  ["integer", "int"],
  ["float", "float"],
  ["float32", "float"],
  ["int64", "long"],
  ["boolean", "boolean"],
  ["null", "null"], // Java's null is the same
  ["void", "void"],
  ["numeric", "double"], // Java uses double for general numeric values
  ["uint64", "BigInteger"], // Java does not have unsigned, use BigInteger for large numbers
  ["uint32", "long"], // Larger range without unsigned
  ["uint16", "int"],
  ["bytes", "byte[]"], // Java uses byte array
  ["float64", "double"], // Use double for 64-bit floating-point numbers
  ["safeint", "long"], // Safe integer can map to long for larger range
  ["utcDateTime", "java.time.ZonedDateTime"], // Java 8+ uses java.time for dates
  ["url", "java.net.URL"], // Java URL type
]);

function getScalarIntrinsicExpression(type: Scalar | IntrinsicType): string {
  if (type.kind === "Scalar" && type.baseScalar && type.namespace?.name !== "TypeSpec") {
    // This is a delcared scalar
    throw new Error("Declared scalar not implemented");
    // return <Reference refkey={type} />;
  }

  const javaType = intrinsicNameToJavaType.get(type.name);
  if (!javaType) {
    throw new Error(`Unknown scalar type ${type.name}`);
  }
  return javaType;
}
