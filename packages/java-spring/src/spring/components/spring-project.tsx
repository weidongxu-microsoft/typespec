import { ProjectDirectory, ProjectDirectoryProps, useProject } from "@alloy-js/java";

export interface SpringProjectProps extends ProjectDirectoryProps {}

export function SpringProject(props: SpringProjectProps) {
  return (
    <ProjectDirectory {...props}>
      <SpringDependencies />
      {props.children}
    </ProjectDirectory>
  );
}

/**
 * Setup spring dependencies
 */
function SpringDependencies() {
  const project = useProject();

  project.scope.addDependency({
    groupId: "org.springframework.boot",
    artifactId: "spring-boot-starter-web",
    version: "3.3.3",
  });
}
