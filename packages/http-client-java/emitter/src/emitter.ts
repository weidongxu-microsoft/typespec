import { createSdkContext, UsageFlags } from "@azure-tools/typespec-client-generator-core";
import { EmitContext, NoTarget, Program, resolvePath } from "@typespec/compiler";
import { promises } from "fs";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";
import { stringify } from "yaml";
import { EmitterOptionsDev } from "./code-model-builder.js";
import { LibName, reportDiagnostic } from "./lib.js";
import { EmitterOptions, LIB_NAME } from "./options.js";
import { trace } from "./utils.js";
import { validateDependencies } from "./validate.js";

export async function $onEmit(context: EmitContext<EmitterOptions>) {
  const program = context.program;
  if (!program.compilerOptions.noEmit) {
    await validateDependencies(program, true);
  }

  if (!program.hasError()) {
    const options = context.options as EmitterOptionsDev;
    if (!options["flavor"]) {
      if (LibName === "@azure-tools/typespec-java") {
        options["flavor"] = "azure";
      }
    }

    const examplesYaml: string[] = [];
    const examplesJava: string[] = [];

    const distPath = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
    const assertsPath = path.resolve(distPath, "assets");
    let samplePath = assertsPath;
    if (options["sample-dir"]) {
      samplePath = path.resolve(program.projectRoot, options["sample-dir"]);
    }
    const files = await promises.readdir(samplePath);
    for (const file of files) {
      if (file.endsWith(".yaml")) {
        const yaml = await promises.readFile(path.resolve(samplePath, file), "utf-8");
        examplesYaml.push(yaml);

        const java = await promises.readFile(
          path.resolve(samplePath, file.replace(".yaml", ".java")),
          "utf-8",
        );
        examplesJava.push(java);
      }
    }
    const baseInstructions = await promises.readFile(
      path.resolve(assertsPath, "base-instructions.md"),
      "utf-8",
    );
    const pomXml = await promises.readFile(path.resolve(assertsPath, "pom.xml"), "utf-8");

    await promises.mkdir(context.emitterOutputDir, { recursive: true }).catch((err) => {
      if (err.code !== "EISDIR" && err.code !== "EEXIST") {
        reportDiagnostic(program, {
          code: "unknown-error",
          format: {
            errorMessage: `Failed to create output directory: ${context.emitterOutputDir}.`,
          },
          target: NoTarget,
        });
        return;
      }
    });

    const client = new OpenAI({
      baseURL: process.env["AZURE_API_BASE"] + "/openai/v1/",
      apiKey: process.env["AZURE_API_KEY"],
    });

    const sdkContext = await createSdkContext(context, LIB_NAME, {
      versioning: { previewStringRegex: /$/ },
    });

    if (!program.hasError()) {
      await program.host.writeFile(resolvePath(context.emitterOutputDir, "pom.xml"), pomXml);

      await Promise.all(
        sdkContext.sdkPackage.models.map(async (model) => {
          if (!(model.access === "public" && model.usage & UsageFlags.Output)) {
            return;
          }

          const filename = resolvePath(context.emitterOutputDir, model.name + ".yaml");

          const yaml = stringify(
            model,
            (k, v) => {
              if (typeof k === "string" && k.startsWith("__")) {
                return undefined; // skip keys starting with "__" from the output
              }
              return v;
            },
            { lineWidth: 0 },
          );

          await program.host.writeFile(filename, yaml);

          if (!options["skip-code"]) {
            const response = await retryWithExponentialBackoff(program, async () => {
              let instructions =
                baseInstructions +
                "Use this YAML and Java as an example of the input and output:\n";
              for (let i = 0; i < examplesYaml.length; i++) {
                instructions +=
                  "```yaml\n" + examplesYaml[i] + "```\n\n```java\n" + examplesJava[i] + "```\n";
              }

              return await client.responses.create({
                model: "gpt-5-mini",
                instructions: instructions,
                input: yaml,
                reasoning: { effort: "low" },
              });
            });

            const javaFilePath = resolvePath(
              context.emitterOutputDir,
              "src/main/java",
              model.namespace.toLocaleLowerCase().replace(/\./g, "/"),
              "models",
            );
            await promises.mkdir(javaFilePath, { recursive: true }).catch((err) => {
              if (err.code !== "EISDIR" && err.code !== "EEXIST") {
                reportDiagnostic(program, {
                  code: "unknown-error",
                  format: {
                    errorMessage: `Failed to create output directory: ${context.emitterOutputDir}.`,
                  },
                  target: NoTarget,
                });
                return;
              }
            });
            const javaFilename = resolvePath(javaFilePath, model.name + ".java");
            const messageOutput = response.output.find((o: any) => o.type === "message") as any;
            const text = messageOutput?.content?.[0];
            if (text?.type === "output_text") {
              await program.host.writeFile(javaFilename, text.text);
            }
          }
        }),
      );
    }
  }
}

/**
 * Retry function with exponential backoff for handling rate limits
 */
async function retryWithExponentialBackoff<T>(
  program: Program,
  operation: () => Promise<T>,
  maxRetries: number = 10,
  baseDelay: number = 1000,
): Promise<T> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      // Check if it's a 429 rate limit error
      if (error?.status === 429 && attempt < maxRetries) {
        attempt++;

        // Get retry-after header value (in seconds)
        const retryAfter =
          error?.headers?.["retry-after"] || error?.response?.headers?.["retry-after"];
        let waitTime: number;

        if (retryAfter) {
          // Use the retry-after header value (convert to milliseconds)
          waitTime = parseInt(retryAfter, 10) * 1000;
        } else {
          // Fallback to exponential backoff
          waitTime = baseDelay * Math.pow(2, attempt - 1);
        }

        // Add some jitter to avoid thundering herd
        const jitter = Math.random() * 0.1 * waitTime;
        const totalWaitTime = waitTime + jitter;

        reportDiagnostic(program, {
          code: "generator-warning",
          format: {
            warningMessage: `Rate limit hit (429). Retrying in ${Math.round(totalWaitTime / 1000)} seconds... (Attempt ${attempt}/${maxRetries})`,
          },
          target: NoTarget,
        });

        await new Promise((resolve) => setTimeout(resolve, totalWaitTime));
        continue;
      }

      // If it's not a 429 error or we've exhausted retries, throw the error
      throw error;
    }
  }

  throw new Error(`Max retries (${maxRetries}) exceeded`);
}

function reportJarOutput(program: Program, jarOutput: string) {
  const lines = jarOutput.split("\n");
  const logs: Array<string> = [];

  // parse stdout to array of logs
  let currentLog = undefined;
  for (const line of lines) {
    if (
      line.startsWith("TRACE ") ||
      line.startsWith("DEBUG ") ||
      line.startsWith("INFO ") ||
      line.startsWith("WARN ") ||
      line.startsWith("ERROR ")
    ) {
      if (currentLog) {
        logs.push(currentLog);
      }
      currentLog = line;
    } else if (currentLog) {
      currentLog = currentLog + "\n" + line;
    }
  }
  if (currentLog) {
    logs.push(currentLog);
  }

  // trace or report the logs, according to log level
  for (const log of logs) {
    if (log.startsWith("ERROR ")) {
      reportDiagnostic(program, {
        code: "generator-error",
        format: {
          errorMessage: log.substring(6),
        },
        target: NoTarget,
      });
    } else if (log.startsWith("WARN ")) {
      reportDiagnostic(program, {
        code: "generator-warning",
        format: {
          warningMessage: log.substring(5),
        },
        target: NoTarget,
      });
    } else {
      const index = log.indexOf(" ");
      trace(program, log.substring(index + 1));
    }
  }
}
