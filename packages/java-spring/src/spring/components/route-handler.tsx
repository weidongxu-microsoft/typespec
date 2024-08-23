import {MethodProps, Method, Annotation, Value} from "@alloy-js/java"

export interface RouteHandlerProps extends MethodProps {
  route: string;
  call: "GET" | "POST" | "PUT" | "DELETE";
}

export function RouteHandler(props: RouteHandlerProps) {
  const springOperation = `${props.call}Mapping`;
  const routeRecord: Record<string, any> = {
    "route" : <Value value={props.route}/>,
  }
  return <>
    <Annotation type={springOperation} value={routeRecord}/>
    <Method {...props}></Method>
  </>
}
