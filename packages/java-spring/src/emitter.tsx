import * as ay from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { MavenProjectConfig } from "@alloy-js/java";
import { EmitContext, Model, Operation } from "@typespec/compiler";
import { isArray, TypeCollector } from "@typespec/emitter-framework";
import { ModelSourceFile } from "@typespec/emitter-framework/java";
import { getAllHttpServices } from "@typespec/http";
import fs from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { emitOperations, emitServices, OperationsGroup } from "./common/index.js";
import { SpringProject } from "./spring/components/index.js";
import { springFramework } from "./spring/libraries/index.js";

const projectConfig: MavenProjectConfig = {
  groupId: "io.typespec",
  artifactId: "generated",
  version: "1.0.0",
  javaVersion: 8,
  build: {
    plugins: [
      {
        groupId: "org.springframework.boot",
        artifactId: "spring-boot-maven-plugin",
      },
    ],
  },
};

/**
 * Just leaving my general thought notes here:
 *
 * A spring application will generally consist of the following parts.
 * - Models (Mapped to actual database objects)
 * - DTOs (Plain model used to hold some data)
 * - Route Controllers (Controllers at a certain endpoint, provides GET, POST, PUT, DELETE etc)
 * - Services (Business logic) that are invoked
 * - Repositories (Way to retrieve data from where it's stored, database etc)
 */
export async function $onEmit(context: EmitContext) {
  // Query types needed in program, models, interfaces etc
  const types = queryTypes(context);

  // Get all http services, then collect all routes from services
  const services = getAllHttpServices(context.program);

  // TODO: For now just take first service
  const service = services[0][0];

  // Collect HttpOperations by container
  const httpOperations = service.operations.reduce(
    (acc, op) => {
      const namespaceKey = op.container?.name ?? "";
      if (!acc[namespaceKey]) {
        acc[namespaceKey] = {
          container: op.container,
          operations: [],
        };
      }

      let operations = acc[namespaceKey].operations;
      operations.push(op);
      acc[namespaceKey] = { ...acc[namespaceKey], operations };
      return acc;
    },
    {} as Record<string, OperationsGroup>
  );

  // TODO: Handle array of services, are we generating all in same project, and just compiling
  // TODO: all operations into one? Or are we generating different java projects for each?
  const result = ay.render(
    <ay.Output externals={[springFramework]}>
      <SpringProject name="TestProject" mavenProjectConfig={projectConfig}>
        <jv.PackageDirectory package="io.typespec.generated">
          <jv.SourceFile path="MainApplication.java">
            <jv.Annotation type={springFramework.SpringBootApplication} />
            <jv.Class public name="MainApplication">
              <jv.Method public static name="main" parameters={{ args: "String[]" }}>
                {springFramework.SpringApplication}.run(MainApplication.class, args);
              </jv.Method>
            </jv.Class>
          </jv.SourceFile>
          {emitServices(context, httpOperations)}
          <jv.PackageDirectory package="models">
            {types.dataTypes.map((type) => (
              <ModelSourceFile type={type} />
            ))}
          </jv.PackageDirectory>
          <jv.PackageDirectory package="controllers">
            {emitOperations(context, httpOperations)}
          </jv.PackageDirectory>
        </jv.PackageDirectory>
      </SpringProject>
    </ay.Output>
  );

  await writeOutput(result, "./tsp-output", false);
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
      if (isArray(model)) continue;
      types.add(model);
    }
  }

  return { dataTypes: [...types], ops: [...ops] };
}

// TODO: Use typespec library to emit files
export async function writeOutput(
  dir: ay.OutputDirectory,
  rootDir: string,
  clean: boolean = false
) {
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
