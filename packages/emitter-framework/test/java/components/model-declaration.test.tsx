import { d } from "@alloy-js/core/testing";
import { PackageDirectory, SourceFile } from "@alloy-js/java/stc";
import { Model, Namespace } from "@typespec/compiler";
import { describe, expect, it } from "vitest";
import { ModelDeclaration } from "../../../src/java/index.js";
import { getEmitOutput, getMultiEmitOutput } from "../utils.js";

describe("TypeSpec Model Declaration", () => {
  it("Takes a model type parameter", async () => {
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
        
        public Widget() {
          
        }
        
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

  it("Takes a generic model type parameter", async () => {
    const code = `
        namespace DemoService;
        model Widget<T> {
          id: string;
          item: T;
        }
    `;

    const output = await getEmitOutput(code, (program) => {
      const [namespace] = program.resolveTypeReference("DemoService");
      const Foo = Array.from((namespace as Namespace).models.values())[0];
      return <ModelDeclaration type={Foo} />;
    });

    expect(output).toBe(d`
      package me.test.code;
      
      public class Widget<T> {
        
        private String id;
        private T item;
        
        public Widget() {
          
        }
        
        public Widget(String id, T item) {
          this.id = id;
          this.item = item;
        }
        
        public String getId() {
          return this.id;
        }
        
        public void setId(String id) {
          this.id = id;
        }
        
        public T getItem() {
          return this.item;
        }
        
        public void setItem(T item) {
          this.item = item;
        }
        
      }
    `);
  });

  it("Extends a model", async () => {
    const code = `
        namespace DemoService;
        model BaseModel {
          value: string;
        }
        
        model Widget extends BaseModel {
          id: string;
        }
    `;

    const output = await getMultiEmitOutput(code, (program) => {
      const [namespace] = program.resolveTypeReference("DemoService");
      const Widget = Array.from((namespace as Namespace).models.values())[1];
      return [
        SourceFile({ path: "Test.java" }).children(() => {
          return <ModelDeclaration type={Widget} />;
        }),
        PackageDirectory({ package: "base" }).children(
          SourceFile({ path: "Test2.java" }).children(() => {
            return <ModelDeclaration type={Widget.baseModel!} />;
          }),
        ),
      ];
    });

    expect(output).toBe(d`
      package me.test.code;
      
      import me.test.code.base.BaseModel;
      
      public class Widget extends BaseModel {
        
        private String id;
        
        public Widget() {
          
        }
        
        public Widget(String id) {
          this.id = id;
        }
        
        public String getId() {
          return this.id;
        }
        
        public void setId(String id) {
          this.id = id;
        }
        
      }
    `);
  });

  it("Extends a generic model", async () => {
    const code = `
        namespace DemoService;
        model BaseModel<T> {
          value: T;
        }
        
        model Widget extends BaseModel<string> {
          id: string;
        }
    `;

    const output = await getMultiEmitOutput(code, (program) => {
      const [namespace] = program.resolveTypeReference("DemoService");
      const Widget = Array.from((namespace as Namespace).models.values())[1];
      return [
        SourceFile({ path: "Test.java" }).children(() => {
          return <ModelDeclaration type={Widget} />;
        }),
        PackageDirectory({ package: "base" }).children(
          SourceFile({ path: "Test2.java" }).children(() => {
            return <ModelDeclaration type={Widget.baseModel!} />;
          }),
        ),
      ];
    });

    expect(output).toBe(d`
      package me.test.code;
      
      import me.test.code.base.BaseModel;
      
      public class Widget extends BaseModel<String> {
        
        private String id;
        
        public Widget() {
          
        }
        
        public Widget(String id) {
          this.id = id;
        }
        
        public String getId() {
          return this.id;
        }
        
        public void setId(String id) {
          this.id = id;
        }
        
      }
    `);
  });

  it("Extends a generic model and passes generic type", async () => {
    const code = `
        namespace DemoService;
        model BaseModel<T> {
          value: T;
        }
        
        model Widget<T> extends BaseModel<T> {
          id: T;
        }
    `;

    const output = await getMultiEmitOutput(code, (program) => {
      const [namespace] = program.resolveTypeReference("DemoService");
      const Widget = Array.from((namespace as Namespace).models.values())[1];
      return [
        SourceFile({ path: "Test.java" }).children(() => {
          return <ModelDeclaration type={Widget} />;
        }),
        PackageDirectory({ package: "base" }).children(
          SourceFile({ path: "Test2.java" }).children(() => {
            return <ModelDeclaration type={Widget.baseModel!} />;
          }),
        ),
      ];
    });

    expect(output).toBe(d`
      package me.test.code;
      
      import me.test.code.base.BaseModel;
      
      public class Widget<T> extends BaseModel<T> {
        
        private T id;
        
        public Widget() {
          
        }
        
        public Widget(T id) {
          this.id = id;
        }
        
        public T getId() {
          return this.id;
        }
        
        public void setId(T id) {
          this.id = id;
        }
        
      }
    `);
  });
});
