import { d } from "@alloy-js/core/testing";
import { Model, Namespace, Operation } from "@typespec/compiler";
import { $ } from "@typespec/compiler/typekit"
import { expect, it } from "vitest";
import { findEmittedFile, getEmitOutput } from "../utils.js";
import { SpringServiceEndpoint } from "../../src/spring/components/spring-service-endpoint.js";
import { ModelDeclaration } from "@typespec/emitter-framework/java";
import { createJavaSpringTestRunner, emit } from "../test-host.js";

it("Creates get service", async () => {
  const code = `
    @route("/people")
    @get op listPeople(): string;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return <SpringServiceEndpoint op={Bar} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      
      @GetMapping("/people")
      public String listPeople();
  `);
});

it("Creates put service", async () => {
  const code = `
    @route("/people")
    @put op listPeople(): string;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return <SpringServiceEndpoint op={Bar} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.PutMapping;
      
      @PutMapping("/people")
      public String listPeople();
  `);
});

it("Creates post service", async () => {
  const code = `
    @route("/people")
    @post op listPeople(): string;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return <SpringServiceEndpoint op={Bar} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.PostMapping;
      
      @PostMapping("/people")
      public String listPeople();
  `);
});

it("Creates delete service", async () => {
  const code = `
    @route("/people")
    @delete op listPeople(): void;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return <SpringServiceEndpoint op={Bar} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.DeleteMapping;
      
      @DeleteMapping("/people")
      public void listPeople();
  `);
});

it("Creates service with body parameter", async () => {
  const code = `
    @route("/people")
    op listPeople(@body name: string): void;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return <SpringServiceEndpoint op={Bar} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.PostMapping;
      import org.springframework.web.bind.annotation.RequestBody;

      @PostMapping("/people")
      public void listPeople(@RequestBody String name);
  `);
});

it("Creates service with header parameter", async () => {
  const code = `
    @route("/people")
    op listPeople(@header name: string): string;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return <SpringServiceEndpoint op={Bar} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.web.bind.annotation.RequestHeader;

      @GetMapping("/people")
      public String listPeople(@RequestHeader("name") String name);
  `);
});

it("Creates service with path parameter", async () => {
  const code = `
    @route("/people")
    op listPeople(@path name: string): void;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return <SpringServiceEndpoint op={Bar} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.web.bind.annotation.PathVariable;

      @GetMapping("/people/{name}")
      public void listPeople(@PathVariable("name") String name);
  `);
});

it("Creates service with path parameter from the path", async () => {
  const code = `
    @route("/people/{name}")
    op listPeople(name: string): void;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;

    const Bar = $.httpOperation.get(Foo);
    return <SpringServiceEndpoint op={Bar} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.web.bind.annotation.PathVariable;

      @GetMapping("/people/{name}")
      public void listPeople(@PathVariable String name);
  `);
});

it("Creates service with query parameter", async () => {
  const code = `
    @route("/people")
    op listPeople(@query name: string): void;
  `;

  const output = await getEmitOutput(code, (program) => {
    const Foo = program.resolveTypeReference("listPeople")[0]! as Operation;
    const Bar = $.httpOperation.get(Foo);
    return <SpringServiceEndpoint op={Bar} />;
  });

  expect(output).toBe(d`
      package me.test.code;
      
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.web.bind.annotation.RequestParam;

      @GetMapping("/people")
      public void listPeople(@RequestParam("name") String name);
  `);
});

it("Creates service with declared model parameter", async () => {
  const code = `
    @service
    namespace DemoService {
      @route("/people")
      namespace People {
        model Person {
          @path id: int32;
          @header firstName: string;
          lastName: string;
        }
    
        @put op replacePerson(@bodyRoot person: Person): Person;
      }
    }
  `;



  const output = await emit(code);
  const testFile = findEmittedFile(output, "PeopleController");
  console.log(output);
  //const file = findEmittedFile(output, "")

  expect(testFile).toBe(d`
    package io.typespec.generated.controllers;
    
    import org.springframework.web.bind.annotation.RestController;
    import org.springframework.web.bind.annotation.RequestMapping;
    import io.typespec.generated.services.PeopleService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.bind.annotation.PutMapping;
    import io.typespec.generated.models.Person;
    import org.springframework.web.bind.annotation.RequestBody;
    import org.springframework.web.bind.annotation.RequestHeader;
    import org.springframework.web.bind.annotation.PathVariable;

    @RestController
    @RequestMapping("/people")
    public class PeopleController {
      private final PeopleService peopleService;
      
      @Autowired
      public PeopleController(PeopleService peopleService) {
        this.peopleService = peopleService;
      }
      
      @PutMapping("/people/{id}")
      public Person replacePerson(@RequestBody Person person, @RequestHeader("first-name") String firstName, @PathVariable("id") Integer id) {
        return peopleService.replacePerson(person, firstName, id);
      }
    }
  `);
});
