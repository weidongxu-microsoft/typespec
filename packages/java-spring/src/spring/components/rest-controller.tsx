import * as jv from "@alloy-js/java"
import { Namespace } from "@typespec/compiler";
import { RouteHandler } from "./route-handler.js";


export interface RestControllerProps {
  nameSpace? : Namespace;
  name: string;
}

export function RestController(props: RestControllerProps) {
  const params:Record<string, string> = {"String" : "sortBy"};
  return <>
    <jv.Annotation type={"RestController"}></jv.Annotation>
    <jv.Class name={props.nameSpace ? `${props.nameSpace.name}Controller` : `${props.name}Controller`}>

      <RouteHandler call={"GET"} route={"/people"} name={"listPeople"}
                    return={"List<Person>"} parameters={params} children={""}>
      </RouteHandler>
    </jv.Class>
  </>
}
