import { HttpOperationParameters, HttpProperty } from "@typespec/http";
import { TypeExpression } from "@typespec/emitter-framework/java";
import { httpDecoratorToSpringAnnotation } from "./utils.js";
import { Annotation} from "@alloy-js/java";
import { getScalarValueSv } from "@typespec/emitter-framework/java";

export interface SpringParametersProps {
  httpOpParams: HttpProperty[]
}

export function getSpringParameters(httpParameters: HttpProperty[]) {
  const paramRecord: Record<string, string> = {};

  for (const param of httpParameters) {
    const paramName = param.property.name;
    const paramType = getParamType(param);
    const paramAnnotation = getParamAnnotation(param);

    paramRecord[paramName] = <>{paramAnnotation} {paramType}</>;
  }
  return paramRecord;

}

export function getParamType(param: HttpProperty) {
  return <TypeExpression type={param.property}></TypeExpression>
}

export function getParamAnnotation(param: HttpProperty): string {
  const decorators = param.property.decorators;

  if (decorators && decorators.length > 0) {
    return (
      <>
        {decorators.map((decorator, index) => {
          // Extract decorator name and remove leading '@'
          const decoratorName = (decorator.definition?.name || "Unknown").replace(/^@/, "");

          // Lookup in the map
          const springAnnotation = httpDecoratorToSpringAnnotation.get(decoratorName);

          // Check if springAnnotation is a valid component or function
          if (springAnnotation) {
            return <Annotation type={springAnnotation} />;
          }
        })}
      </>
    );
  } else {
    return <></>;
  }
}



