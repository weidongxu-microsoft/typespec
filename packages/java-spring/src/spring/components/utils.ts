import { springFramework } from "../libraries/index.js";
import {Refkey} from "@alloy-js/core";



export const httpDecoratorToSpringAnnotation = new Map<string, Refkey>([
  ["get", springFramework.GetMapping],
  ["put", springFramework.PutMapping],
  ["delete", springFramework.DeleteMapping],
  ["post", springFramework.PostMapping],
  ["body", springFramework.RequestBody],
  ["path", springFramework.PathVariable],
  ["header", springFramework.RequestHeader]
])


