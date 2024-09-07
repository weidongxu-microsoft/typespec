import * as jv from "@alloy-js/java";
import { Namespace } from "@typespec/compiler";

export interface NamespaceDeclarationProps {
  namespace: Namespace;
}

/**
 * Generic namespace handler that takes the namespace and generates the base level objects
 * on the namespace. This will be useful for generating Library types. Service level namespaces
 * and types will usually be generated differently.
 *
 * This component takes a top-down approach, where it takes the top level namespace and generates
 * its direct children under its directory, then creates a child directory for each child namespace
 * and repeats the process.
 */
export function NamespaceDeclaration(props: NamespaceDeclarationProps) {
  // Collect child namespaces
  const namespaces = Array.from(props.namespace.namespaces.values());

  // Collect other objects, these will be declared directly under this namespace

  // Models, represented as classes
  const models = Array.from(props.namespace.models.values());

  // Operations, these are the service endpoints. Usually can be in a namespace, or under an interface.
  const operations = Array.from(props.namespace.operations.values());

  // Enums, represents as java enums
  const enums = Array.from(props.namespace.enums.values());

  // TODO: Not sure how to represent these yet
  const unions = Array.from(props.namespace.unions.values());

  // TODO: Not sure how to represent these yet
  const scalars = Array.from(props.namespace.scalars.values());

  // Interfaces, represented with java interfaces
  const interfaces = Array.from(props.namespace.interfaces.values());

  // Make name like package, lowercase
  const sanitizeName = props.namespace.name.toLowerCase();

  // If name is blank (usually root namespace) don't render package directory
  if (!sanitizeName) {
    return (
      <>
        {namespaces.map((namespace) => {
          return <NamespaceDeclaration namespace={namespace} />;
        })}
      </>
    );
  }

  return (
    <jv.PackageDirectory package={sanitizeName}>
      {namespaces.map((namespace) => {
        return <NamespaceDeclaration namespace={namespace} />;
      })}
    </jv.PackageDirectory>
  );
}
