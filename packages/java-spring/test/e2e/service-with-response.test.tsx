import { describe, expect, it } from "vitest";
import { emit } from "../test-host.js";
import { findEmittedFile } from "../utils.js";
import { d } from "@alloy-js/core/testing";


describe("Service with responses", async () => {
  const tspCode = `
    @service
    @useAuth(BearerAuth)
    namespace DemoService {
    
      @error
      model CustomError {
        @statusCode _: 400;
        code: int32;
        message: string;
      }
    
      @route("/people")
      namespace People {
        model Person<T> {
          id: int32;
          firstName: string;
          lastName: string;
          special: T;
          pets: Pets.Pet[];
        }
    
        @get op getPerson(@path id: int32): {
          @body body: Person<string>;
          @header testHeader: string;
        } | NotFoundResponse | CustomError;
        @get op listPeople(): Person<string>[] | CustomError;
        @post op createPerson(@body person: Person<string>): CreatedResponse | CustomError;
      }
    
      @route("/pets")
      namespace Pets {
        model Pet {
          name: string | int32;
          owner?: People.Person<int32>;
        }
    
        op listPets(): {
         @body body: Pet[];
         @header x: string;
        } | CustomError;    
      }
    }
  `;

  const result = await emit(tspCode);

  it("Emits main spring application class", () => {
    const file = findEmittedFile(result, "io.typespec.generated.MainApplication.java");

    expect(file).toBe(d`
      package io.typespec.generated;

      import org.springframework.boot.autoconfigure.SpringBootApplication;
      import org.springframework.boot.SpringApplication;

      @SpringBootApplication
      public class MainApplication {
        public static void main(String[] args) {
          SpringApplication.run(MainApplication.class, args);
        }
      }
    `);
  });

  it("Emits Person Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.Person.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import java.util.List;
      
      
      public class Person<T> {
        
        private Integer id;
        private String firstName;
        private String lastName;
        private String special;
        private List<Pet> pets;
        
        public Person() {
          
        }
        
        public Person(Integer id, String firstName, String lastName, String special, List<Pet> pets) {
          this.id = id;
          this.firstName = firstName;
          this.lastName = lastName;
          this.special = special;
          this.pets = pets;
        }
        
        public Integer getId() {
          return this.id;
        }
        
        public void setId(Integer id) {
          this.id = id;
        }
        
        public String getFirstName() {
          return this.firstName;
        }
        
        public void setFirstName(String firstName) {
          this.firstName = firstName;
        }
        
        public String getLastName() {
          return this.lastName;
        }
        
        public void setLastName(String lastName) {
          this.lastName = lastName;
        }
        
        public String getSpecial() {
          return this.special;
        }
        
        public void setSpecial(String special) {
          this.special = special;
        }
        
        public List<Pet> getPets() {
          return this.pets;
        }
        
        public void setPets(List<Pet> pets) {
          this.pets = pets;
        }
        
      }
    `)
  })

  it("Emits Pet Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.Pet.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      
      public class Pet {
        
        /**
        * Represents union types [String, Integer]
        */
        private Object name;
        private Person<Integer> owner;
        
        public Pet() {
          
        }
        
        public Pet(Object name, Person<Integer> owner) {
          this.name = name;
          this.owner = owner;
        }
        
        public Object getName() {
          return this.name;
        }
        
        public void setName(Object name) {
          this.name = name;
        }
        
        public Person<Integer> getOwner() {
          return this.owner;
        }
        
        public void setOwner(Person<Integer> owner) {
          this.owner = owner;
        }
        
      }
    `)
  })

  it("Emits CustomError Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.CustomError.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
      
      @JsonIgnoreProperties({"cause", "stackTrace", "localizedMessage", "suppressed"})
      public class CustomError extends Exception {
        
        private Integer code;
        private String message;
        
        public CustomError() {
          
        }
        
        public CustomError(Integer code, String message) {
          this.code = code;
          this.message = message;
        }
        
        public Integer getCode() {
          return this.code;
        }
        
        public void setCode(Integer code) {
          this.code = code;
        }
        
        public String getMessage() {
          return this.message;
        }
        
        public void setMessage(String message) {
          this.message = message;
        }
        
      }
    `)
  })

  it("Emits ResponseWithHeaders Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.ResponseWithHeaders.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      import org.springframework.util.MultiValueMap;
      
      public class ResponseWithHeaders<T> {
        private T response;
        private MultiValueMap<String, String> headers;
        public ResponseWithHeaders(T response, MultiValueMap<String, String> headers) {
          this.response = response;
          this.headers = headers;
        }
        public ResponseWithHeaders(MultiValueMap<String, String> headers) {
          this.response = null;
          this.headers = headers;
        }
        
        public T getResponse() {
          return this.response;
        }
        
        public void setResponse(T response) {
          this.response = response;
        }
        
        public MultiValueMap<String, String> getHeaders() {
          return this.headers;
        }
        
        public void setHeaders(MultiValueMap<String, String> headers) {
          this.headers = headers;
        }
      }
    `)
  })

  it("Emits NoBody Model", () => {
    const file = findEmittedFile(result, "io.typespec.generated.models.NoBody.java");

    expect(file).toBe(d`
      package io.typespec.generated.models;
      
      /**
      * Represents a response with no body. Used for custom response classes
      */
      public class NoBody {
        public NoBody() {
          
        }
      }
    `)
  })

  it("Emits GetPersonResponse", () => {
    const file = findEmittedFile(result, "io.typespec.generated.responses.GetPersonResponse.java");

    expect(file).toBe(d`
      package io.typespec.generated.responses;
      
      import io.typespec.generated.models.ResponseWithHeaders;
      import io.typespec.generated.models.Person;
      import io.typespec.generated.models.NoBody;
      
      public class GetPersonResponse {
        private ResponseWithHeaders<Person<String>> person;
        private NoBody notFoundResponse;
        
        public GetPersonResponse() {
          
        }
        
        public ResponseWithHeaders<Person<String>> getPerson() {
          return this.person;
        }
        
        public void setPerson(ResponseWithHeaders<Person<String>> value) {
          this.person = value;
        }
        
        public NoBody getNotFoundResponse() {
          return this.notFoundResponse;
        }
        
        public void setNotFoundResponse(NoBody value) {
          this.notFoundResponse = value;
        }
      }
    `)
  })

  it("Emits PeopleController", () => {
    const file = findEmittedFile(result, "io.typespec.generated.controllers.PeopleController.java");

    expect(file).toBe(d`
      package io.typespec.generated.controllers;
      
      import org.springframework.web.bind.annotation.RestController;
      import io.typespec.generated.services.PeopleService;
      import org.springframework.beans.factory.annotation.Autowired;
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.http.ResponseEntity;
      import org.springframework.web.bind.annotation.PathVariable;
      import org.springframework.http.HttpStatus;
      import io.typespec.generated.models.CustomError;
      import java.util.List;
      import io.typespec.generated.models.Person;
      import org.springframework.web.bind.annotation.PostMapping;
      import org.springframework.web.bind.annotation.RequestBody;
      import io.typespec.generated.responses.GetPersonResponse;
      
      @RestController
      public class PeopleController {
        private final PeopleService peopleService;
        
        @Autowired
        public PeopleController(PeopleService peopleService) {
          this.peopleService = peopleService;
        }
        
        @GetMapping("/people/{id}")
        public ResponseEntity<?> getPerson(@PathVariable("id") Integer id) {
          try {
            GetPersonResponse returnedBody = peopleService.getPerson(id);
            if (returnedBody.getPerson() != null) {
              return new ResponseEntity<>(returnedBody.getPerson().getResponse(), returnedBody.getPerson().getHeaders(), HttpStatus.valueOf(200));
            } else if (returnedBody.getNotFoundResponse() != null) {
              return new ResponseEntity<>(HttpStatus.valueOf(404));
            }
            return new ResponseEntity<>(HttpStatus.valueOf(200));
          } catch (CustomError e) {
            return new ResponseEntity<>(e, HttpStatus.valueOf(400));
          }
        }
        
        @GetMapping("/people")
        public ResponseEntity<?> listPeople() {
          try {
            List<Person<String>> returnedBody = peopleService.listPeople();
            return new ResponseEntity<>(returnedBody, HttpStatus.valueOf(200));
          } catch (CustomError e) {
            return new ResponseEntity<>(e, HttpStatus.valueOf(400));
          }
        }
        
        @PostMapping("/people")
        public ResponseEntity<?> createPerson(@RequestBody Person<String> person) {
          try {
            peopleService.createPerson(person);
            return new ResponseEntity<>(HttpStatus.valueOf(201));
          } catch (CustomError e) {
            return new ResponseEntity<>(e, HttpStatus.valueOf(400));
          }
        }
      }
    `);
  });

  it("Emits PetsController", () => {
    const file = findEmittedFile(result, "io.typespec.generated.controllers.PetsController.java");

    expect(file).toBe(d`
      package io.typespec.generated.controllers;
      
      import org.springframework.web.bind.annotation.RestController;
      import io.typespec.generated.services.PetsService;
      import org.springframework.beans.factory.annotation.Autowired;
      import org.springframework.web.bind.annotation.GetMapping;
      import org.springframework.http.ResponseEntity;
      import io.typespec.generated.models.ResponseWithHeaders;
      import java.util.List;
      import io.typespec.generated.models.Pet;
      import org.springframework.http.HttpStatus;
      import io.typespec.generated.models.CustomError;
      
      @RestController
      public class PetsController {
        private final PetsService petsService;
        
        @Autowired
        public PetsController(PetsService petsService) {
          this.petsService = petsService;
        }
        
        @GetMapping("/pets")
        public ResponseEntity<?> listPets() {
          try {
            ResponseWithHeaders<List<Pet>> returnedBody = petsService.listPets();
            return new ResponseEntity<>(returnedBody.getResponse(), returnedBody.getHeaders(), HttpStatus.valueOf(200));
          } catch (CustomError e) {
            return new ResponseEntity<>(e, HttpStatus.valueOf(400));
          }
        }
      }
    `);
  });
})
