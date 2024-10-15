import "@typespec/http";
using TypeSpec.Http;
@service
namespace DemoService;

@route("/people")
namespace People {
  model Person {
    id: int32;
    name: string;
    age: int32;
  }

  @get op listPeople(@header Authorization: string, @query name: string): Person[];

  @post op createPerson(@body newPerson: Person): Person;

  @put op updatePerson(@path id: int32, @body updatedPerson: Person): Person;

  @delete op deletePerson(@path id: int32): void;

}
