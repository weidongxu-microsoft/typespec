import { Child, Refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { springFramework } from "../libraries/index.js";

export interface AnnotationsProps {
  annotationKind: string;
  annotationParameters?: string;
}

export function SpringRouteAnnotation({ annotationKind, annotationParameters }: AnnotationsProps) {
  const kind = springAnnotations.get(annotationKind);
  if (annotationParameters) {
    const valueRecord: Record<string, Child> = { "": annotationParameters };
    return <jv.Annotation type={kind} value={valueRecord} />;
  }
  return <jv.Annotation type={kind} />;
}

export const springAnnotations = new Map<string, Refkey>([
  ["get", springFramework.GetMapping],
  ["put", springFramework.PutMapping],
  ["delete", springFramework.DeleteMapping],
  ["post", springFramework.PostMapping],
  ["patch", springFramework.PatchMapping],
  ["body", springFramework.RequestBody],
  ["path", springFramework.PathVariable],
  ["header", springFramework.RequestHeader],
  ["query", springFramework.RequestParam],
]);
