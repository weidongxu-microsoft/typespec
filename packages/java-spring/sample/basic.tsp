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
      @header special: T;
      pets: Pets.Pet[];
    }

    @get op listPeople(@body sortBy?: string): Person<string>[];

    @route("/{id}")
    @put op replacePerson(...Person<int32>): Person<int32>;
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
