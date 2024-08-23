import { Model, Namespace } from "@typespec/compiler";
import * as jv from "@alloy-js/java";
import { RestController } from "./rest-controller.js";

export interface ModelSourceFileProps extends jv.SourceFileProps{
  nameSpace?: Namespace;
}

export function ControllerSourceFile({ nameSpace, path }: ModelSourceFileProps) {
  const pathName =nameSpace ? nameSpace.name + "Controller" + ".java" : path + "Controller" + ".java";
  return<jv.SourceFile path={pathName}><RestController name={"Person"}></RestController>
  </jv.SourceFile>
}
