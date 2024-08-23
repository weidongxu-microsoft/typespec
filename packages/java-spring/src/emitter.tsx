import * as ay from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { EmitContext, Model, Operation } from "@typespec/compiler";
import { ModelDeclaration, ModelSourceFile } from "@typespec/emitter-framework/java";
import { TypeCollector } from "@typespec/emitter-framework";
import fs from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { SpringProject } from "./spring/components/index.js";
import { springFramework } from "./spring/libraries/index.js";
import { MavenProjectConfig } from "@alloy-js/java";
import { Class } from "@alloy-js/java";

export async function $onEmit(context: EmitContext) {
  const types = queryTypes(context);
  const dataTypes = types.dataTypes
  /*dataTypes.forEach((dataType, index) => {
    console.log(`\n======= Entry ${index} =======`);
    console.log(`Data Type Name: ${dataType.name}`);
    console.log('Details:', dataType);
    console.log('Properties:', [...dataType.properties.values()]);
    console.log('===============================\n');
  });
  console.log('ops :', types.ops);*/

  const projectConfig: MavenProjectConfig = {
    groupId: 'net.microsoft',
    artifactId: 'generated',
    version: '1.0.0',
    javaVersion: 8,
  }

  // TODO: Indent is really weird in generated output
  const result = ay.render(
    <ay.Output externals={[springFramework]}>
      <SpringProject name='TestProject' mavenProjectConfig={projectConfig}>
        <jv.PackageDirectory package="me.test.code">
          <jv.SourceFile path="MainApplication.java">
            <jv.Annotation type={springFramework.SpringBootApplication} />
            <jv.Class public name="MainApplication">
              <jv.Method public static name="main" parameters={{ args: "String[]" }}>
                {springFramework.SpringApplication}.run(MainApplication.class, args);
              </jv.Method>
            </jv.Class>
          </jv.SourceFile>

          <jv.PackageDirectory package={"models"}>
            <ModelSourceFile type={types.dataTypes[1]}>
            </ModelSourceFile>
            <ModelSourceFile type={types.dataTypes[3]}>
            </ModelSourceFile>
          </jv.PackageDirectory>
        </jv.PackageDirectory>
      </SpringProject>
    </ay.Output>,
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
