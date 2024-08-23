import { Model } from "@typespec/compiler";
import * as jv from "@alloy-js/java";
import { ModelDeclaration } from "./model-declaration.js";

export interface ModelSourceFileProps{
  type: Model;
}

export function ModelSourceFile({ type }: ModelSourceFileProps) {
  const pathName = type.name + ".java";
  return<jv.SourceFile path={pathName}><ModelDeclaration type={type}></ModelDeclaration>
  </jv.SourceFile>
}
