import { code, refkey } from "@alloy-js/core";
import { Generics, javaUtil, Value } from "@alloy-js/java";
import { IntrinsicType, Scalar, Type } from "@typespec/compiler";
import { isArray } from "../../core/index.js";

export interface TypeExpressionProps {
  type: Type;
}

export function TypeExpression({ type }: TypeExpressionProps) {
  switch (type.kind) {
    case "Scalar":
    case "Intrinsic":
      return <>{getScalarIntrinsicExpression(type)}</>;
    case "Boolean":
    case "Number":
    case "String":
      return <Value value={type.value} />;
    case "Union":
      return "Object";
    case "EnumMember":
      return (
        <>
          {type.enum.name}.{type.name}
        </>
      );
    case "ModelProperty":
      return <TypeExpression type={type.type} />;
    case "Model":
      if (isArray(type)) {
        return code`${javaUtil.List}${(<Generics types={[<TypeExpression type={type.indexer.value} />]} />)}`;
      }

      // Collect generic arguments
      const genericArgs = type.templateMapper?.args;
      const genericsString =
        (genericArgs?.length ?? 0) > 0 ? (
          <Generics types={genericArgs?.map((gen) => <TypeExpression type={gen as Type} />)} />
        ) : (
          ""
        );

      return code`${refkey(type)}${genericsString}`;

    default:
    // console.warn("TypeExpression: unhandled type", type);
  }
}

export const intrinsicNameToJavaType = new Map<string, string>([
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
