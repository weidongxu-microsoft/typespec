import * as jv from "@alloy-js/java";
import { Namespace } from "@typespec/compiler";

export interface NamespaceDeclarationProps {
  namespace: Namespace;
}

export function NamespaceDeclaration(props: NamespaceDeclarationProps) {
  // Collect child namespaces
  const namespaces = Array.from(props.namespace.namespaces.values());

  // Make name like package, lowercase
  const sanitizeName = props.namespace.name.toLowerCase();

  // If name is blank (usually root namespace) don't render package directory
  if (!sanitizeName) {
    return (
      <>
        {namespaces.map((namespace) => {
          return <NamespaceDeclaration namespace={namespace} />;
        })}
        <jv.SourceFile path="index.java"></jv.SourceFile>
      </>
    );
  }

  return (
    <jv.PackageDirectory package={sanitizeName}>
      {namespaces.map((namespace) => {
        return <NamespaceDeclaration namespace={namespace} />;
      })}
      <jv.SourceFile path="index.java"></jv.SourceFile>
    </jv.PackageDirectory>
  );
}
