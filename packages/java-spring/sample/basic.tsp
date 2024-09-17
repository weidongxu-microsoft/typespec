import "@typespec/http";
using TypeSpec.Http;
@service
namespace DemoService {

  @route("/people")
  namespace People {
    model Person<T> {
      id: int32;
      firstName: string;
      lastName: string;
      special: T;
      pets: Pets.Pet[];
    }

    @get op listPeople(@body sortBy?: string): Person<string>[];

    @route("/{id}")
    @put op replacePerson(@header("NewPerson") person: Person<int32>, @path id: int32, @body name: string): Person<int32>;
  }

  // This will generate a RestController for the /pets endpoint
  @route("/pets")
  namespace Pets {
    // Just defined inside package
    model Pet {
      name: string | int32;
      owner?: People.Person<int32>;
    }

    // This is default get, will generate a RouteHandler for '/'
    op listPets(): Pet[];
  }
}
