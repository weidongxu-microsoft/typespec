import * as ay from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { MavenProjectConfig } from "@alloy-js/java";
import { EmitContext, Model, Namespace, Operation, StringValue } from "@typespec/compiler";
import { isArray, TypeCollector } from "@typespec/emitter-framework";
import { ModelSourceFile } from "@typespec/emitter-framework/java";
import fs from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { SpringProject } from "./spring/components/index.js";
import { springFramework } from "./spring/libraries/index.js";

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
  // Get all types in program, categorize them into models, operations, etc based on tags
  // Generate in respective sections of program.

  const types = queryTypes(context);

  // types.dataTypes.forEach((dataType, index) => {
  //   console.log(`\n======= Entry ${index} =======`);
  //   console.log(`Data Type Name: ${dataType.name}`);
  //   console.log("Details:", dataType);
  //   console.log("Decorators:", dataType.decorators);
  //   console.log("===============================\n");
  // });

  const projectConfig: MavenProjectConfig = {
    groupId: "net.microsoft",
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

  // TODO: Indent is really weird in generated output
  const result = ay.render(
    <ay.Output externals={[springFramework]}>
      <SpringProject name="TestProject" mavenProjectConfig={projectConfig}>
        <jv.PackageDirectory package="me.test.code">
          <jv.SourceFile path="MainApplication.java">
            <jv.Annotation type={springFramework.SpringBootApplication} />
            <jv.Class public name="MainApplication">
              <jv.Method public static name="main" parameters={{ args: "String[]" }}>
                {springFramework.SpringApplication}.run(MainApplication.class, args);
              </jv.Method>
            </jv.Class>
          </jv.SourceFile>
          <jv.PackageDirectory package="models">
            {types.dataTypes.map((type) => (
              <ModelSourceFile type={type} />
            ))}
          </jv.PackageDirectory>
          <jv.PackageDirectory package="controllers">
            {emitOperations(types.ops)}
          </jv.PackageDirectory>
        </jv.PackageDirectory>
      </SpringProject>
    </ay.Output>
  );

  await writeOutput(result, "./tsp-output", false);
}

interface NamespaceOperations {
  namespace?: Namespace;
  operations: Operation[];
}

/**
 * Collect operations by namespace. Create RouteHandler for namespace. Declare those
 * operations in that route handler as the service endpoints.
 *
 * @param ops
 */
function emitOperations(ops: Operation[]) {
  const operationsByNamespace = ops.reduce(
    (acc, op) => {
      const namespaceKey = op.namespace?.name ?? "";
      if (!acc[namespaceKey]) {
        acc[namespaceKey] = {
          namespace: op.namespace,
          operations: [],
        };
      }

      let operations = acc[namespaceKey].operations;
      operations.push(op);
      acc[namespaceKey] = { ...acc[namespaceKey], operations };
      return acc;
    },
    {} as Record<string, NamespaceOperations>
  );

  return (
    <>
      {Object.values(operationsByNamespace).map((nsOps) => {
        const routePath = (
          nsOps?.namespace?.decorators?.find((d) => d?.definition?.name === "@route")?.args?.[0]
            ?.value as StringValue
        )?.value;

        return (
          <jv.SourceFile path={nsOps.namespace?.name + "Controller.java"}>
            <jv.Annotation type={springFramework.RestController} />
            <jv.Annotation
              type={springFramework.RequestMapping}
              value={{ path: <jv.Value value={routePath} /> }}
            />
            <jv.Class public name={nsOps.namespace?.name + "Controller"}>
              {nsOps.operations.map((op) => {
                return (
                  <>
                    <jv.Annotation type={springFramework.GetMapping} />
                    <jv.Method public name={op.name}>
                      throw new UnsupportedOperationException("Not implemented");
                    </jv.Method>
                  </>
                );
              })}
            </jv.Class>
          </jv.SourceFile>
        );
      })}
    </>
  );
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
