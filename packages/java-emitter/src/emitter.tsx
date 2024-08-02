import * as ay from "@alloy-js/core";
import { code } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { AccessModifier } from "@alloy-js/java";
import { EmitContext, Model, Operation } from "@typespec/compiler";
import { TypeCollector } from "@typespec/emitter-framework";
import fs from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export async function $onEmit(context: EmitContext) {
  const types = queryTypes(context);

  const result = ay.render(
    <ay.Output>
      <jv.ProjectDirectory groupId="me.example" artifactId="test" version="1.0.0">
        <jv.PackageDirectory package="me.example.code">
          <jv.SourceFile path="Main.java">
            {code`
            public class Main {
              public static void main(String[] args) {
                System.out.println("Hello, World!");
                ${<jv.Reference refkey={ay.refkey("Model")} />} myModel = new ${<jv.Reference refkey={ay.refkey("Model")} />}();
              }
            }
          `}
          </jv.SourceFile>
          <jv.Declaration name="Model" accessModifier={AccessModifier.PUBLIC}>
            <jv.SourceFile path="Model.java">
              {code`
              public class Model {
                
                public String myName = "Test";
                
              }
            `}
            </jv.SourceFile>
          </jv.Declaration>
        </jv.PackageDirectory>
      </jv.ProjectDirectory>
    </ay.Output>
  );

  await writeOutput(result, "./tsp-output", true);
}


function queryTypes(context: EmitContext) {
  const types = new Set<Model>();
  const ops = new Set<Operation>();
  const globalns = context.program.getGlobalNamespaceType();
  const allTypes = new TypeCollector(globalns).flat();
  for (const op of allTypes.operations) {
    ops.add(op);

    const referencedTypes = new TypeCollector(op).flat();
    for (const model of referencedTypes.models) {
      types.add(model);
    }
  }

  return { dataTypes: [...types], ops: [...ops] };
}

export async function writeOutput(dir: ay.OutputDirectory, rootDir: string, clean: boolean = false) {
  if (clean && fs.existsSync(rootDir)) await rm(rootDir, { recursive: true });

  for (const item of dir.contents) {
    if (item.kind === "file") {
      const targetLocation = join(rootDir, item.path);
      await mkdir(dirname(targetLocation), { recursive: true });
      await writeFile(targetLocation, item.contents);
    } else {
      await writeOutput(item, rootDir);
    }
  }
}
