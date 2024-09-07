import { Children } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { useJavaNamePolicy } from "@alloy-js/java";
import { springFramework } from "../libraries/index.js";

export interface RestControllerProps {
  name: string;
  routePath?: string;
  children?: Children;
}

export function RestController(props: RestControllerProps) {
  const namePolicy = useJavaNamePolicy();
  const name = namePolicy.getName(props.name, "class");

  return (
    <>
      <jv.SourceFile path={`${name}Controller.java`}>
        <jv.Annotation type={springFramework.RestController} />
        {props.routePath && (
          <jv.Annotation
            type={springFramework.RequestMapping}
            value={{ path: <jv.Value value={props.routePath} /> }}
          />
        )}
        <jv.Class public name={`${name}Controller`}>
          {props.children}
        </jv.Class>
      </jv.SourceFile>
    </>
  );
}
