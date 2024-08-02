import { createTypeSpecLibrary } from "@typespec/compiler";

export const $lib = createTypeSpecLibrary({
  name: "java-emitter",
  diagnostics: {},
});

export const { reportDiagnostic, createDiagnostic } = $lib;
