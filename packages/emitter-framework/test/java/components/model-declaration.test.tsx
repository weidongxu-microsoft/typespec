import { d } from "@alloy-js/core/testing";
import { Model } from "@typespec/compiler";
import { describe, expect, it } from "vitest";
import { ModelDeclaration } from "../../../src/java/index.js";
import { getEmitOutput } from "../utils.js";

describe("TypeSpec Model Declaration", () => {
  it("Take a model type parameter", async () => {
    const code = `
        model Widget {
          id: string;
          weight: int32;
          color: string;
        }
    `;

    const output = await getEmitOutput(code, (program) => {
      const Foo = program.resolveTypeReference("Widget")[0]! as Model;
      return <ModelDeclaration type={Foo} />;
    });

    expect(output).toBe(d`
      package me.test.code;
      
      public class Widget {
        
        private String id;
        private Integer weight;
        private String color;
        
        public Widget(String id, Integer weight, String color) {
          this.id = id;
          this.weight = weight;
          this.color = color;
        }
        
        public String getId() {
          return this.id;
        }
        
        public void setId(String id) {
          this.id = id;
        }
        
        public Integer getWeight() {
          return this.weight;
        }
        
        public void setWeight(Integer weight) {
          this.weight = weight;
        }
        
        public String getColor() {
          return this.color;
        }
        
        public void setColor(String color) {
          this.color = color;
        }
        
      }
    `);
  });
});
