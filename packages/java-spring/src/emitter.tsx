import * as ay from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { javaUtil, MavenProjectConfig } from "@alloy-js/java";
import { EmitContext, getNamespaceFullName, isStdNamespace, Type } from "@typespec/compiler";
import { TypeCollector } from "@typespec/emitter-framework";
import { ModelDeclaration } from "@typespec/emitter-framework/java";
import {
  getAllHttpServices,
  namespace as HttpNamespace,
  HttpOperation,
  HttpService,
} from "@typespec/http";
import { emitOperations, emitServices, OperationsGroup } from "./common/index.js";
import { SpringProject } from "./spring/components/index.js";
import { springFramework } from "./spring/libraries/index.js";

const RestNamespace = "TypeSpec.Rest";

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

  // Collect operations from all services into one
  const serviceOperations: HttpOperation[] = [];

  services.forEach((service) => {
    serviceOperations.push(...((service[0] as HttpService)?.operations ?? []));
  });

  // Collect HttpOperations by container
  const httpOperations = serviceOperations.reduce(
    (acc, op) => {
      const namespaceKey = op.container?.name ?? "";
      if (!acc[namespaceKey]) {
        acc[namespaceKey] = {
          container: op.container,
          operations: [],
        };
      }

      const operations = acc[namespaceKey].operations;
      operations.push(op);
      acc[namespaceKey] = { ...acc[namespaceKey], operations };
      return acc;
    },
    {} as Record<string, OperationsGroup>
  );

  const outputDir = context.emitterOutputDir;
  return (
    <ay.Output externals={[springFramework, javaUtil]} basePath={outputDir}>
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
            {types.dataTypes
              .filter((type) => type.kind === "Model")
              .map((type) => (
                <jv.SourceFile path={type.name + ".java"}>
                  <ModelDeclaration type={type} />
                </jv.SourceFile>
              ))}
          </jv.PackageDirectory>
          <jv.PackageDirectory package="controllers">
            {emitOperations(context, httpOperations)}
          </jv.PackageDirectory>
        </jv.PackageDirectory>
      </SpringProject>
    </ay.Output>
  );
}

// TODO: Only query types from operations, and recursively add referring types
function queryTypes(context: EmitContext) {
  const types = new Set<Type>();
  const globalns = context.program.getGlobalNamespaceType();
  const allTypes = new TypeCollector(globalns).flat();
  for (const dataType of [
    ...allTypes.models,
    ...allTypes.unions,
    ...allTypes.enums,
    ...allTypes.scalars,
  ]) {
    if (isNoEmit(dataType)) {
      continue;
    }

    types.add(dataType);
  }

  return { dataTypes: [...types] };
}

function isNoEmit(type: Type): boolean {
  // Skip anonymous types
  if (!(type as any).name) {
    return true;
  }

  if ("namespace" in type && type.namespace) {
    if (isStdNamespace(type.namespace)) {
      return true;
    }

    const fullNamespaceName = getNamespaceFullName(type.namespace);

    if ([HttpNamespace].includes(fullNamespaceName)) {
      return true;
    }
    if ([RestNamespace].includes(fullNamespaceName)) {
      return true;
    }
  }

  return false;
}
