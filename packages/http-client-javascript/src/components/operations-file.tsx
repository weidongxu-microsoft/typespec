import { Children, mapJoin, refkey, SourceDirectory } from "@alloy-js/core";
import * as ts from "@alloy-js/typescript";
import { Operation, Service, Type } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit";
import { FunctionDeclaration, TypeExpression } from "@typespec/emitter-framework/typescript";
import { getClientContextRefkey } from "./client-context.js";
import { HttpRequest } from "./http-request.js";
import { HttpResponse } from "./http-response.jsx";

export interface OperationsProps {
  operations: Map<string, Operation[]>;
  service?: Service;
}

export function Operations(props: OperationsProps) {
  const namePolicy = ts.createTSNamePolicy();
  return mapJoin(
    props.operations,
    (key, operations) => {
      const containerParts = key.split("/") ?? [];
      const subPathExport = ["api", ...containerParts]
        .map((p) => namePolicy.getName(p, "interface-member"))
        .join("/");
      return getSourceDirectory(
        containerParts,
        <><ts.BarrelFile export={subPathExport} /><OperationsFile path="operations.ts" operations={operations} service={props.service} /></>
      );
    },
    { joiner: "\n\n" }
  );
}

function getSourceDirectory(directoyrPath: string[], children: Children) {
  const currentPath = [...directoyrPath];
  const current = currentPath.shift();

  if (!current) {
    return children;
  }

  const namePolicy = ts.createTSNamePolicy();
  const directoryName = namePolicy.getName(current, "variable");

  return <SourceDirectory path={directoryName}>
      {getSourceDirectory(currentPath, children)}
    </SourceDirectory>;
}

export interface OperationsFileProps {
  path: string;
  operations: Operation[];
  service?: Service;
}

export function OperationsFile(props: OperationsFileProps) {
  if (!props.service) {
    return null;
  }

  return <ts.SourceFile path={props.path}>
      {mapJoin(props.operations, (operation) => {
        const responses = $.httpOperation.getResponses(operation).filter(r => r.statusCode !== "*")

        let httpResponse: Type | undefined;
        if(responses.length > 1) {
          const res = [...new Set(responses.map(r => r.responseContent.body?.type))].filter(t => t !== undefined)
          httpResponse = $.union.create({
            variants: res.map(t => $.unionVariant.create({type: t})),
          })
        } else {
          httpResponse = responses[0].responseContent.body?.type
        }
        const responseRefkey = refkey();
        return (
          <FunctionDeclaration export async type={operation} returnType={httpResponse ?<TypeExpression type={httpResponse} /> : "void"} parameters={{"client": <ts.Reference refkey={getClientContextRefkey(props.service!)}/>}}>
            <HttpRequest operation={operation} responseRefkey={responseRefkey} />
            <HttpResponse operation={operation} responseRefkey={responseRefkey} />
          </FunctionDeclaration>
        );
      }, {joiner: "\n\n"})}
    </ts.SourceFile>;
}
