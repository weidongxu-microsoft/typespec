import "@typespec/http";
using TypeSpec.Http;
@service
namespace DemoService {

  @route("/people")
  namespace People {
    model Person<T> {
      @path id: int32;
      @header firstName: string;
      special: T;
      @header lastName: string;
      pets: Pets.Pet[];
    }

    @get op listPeople(@body sortBy?: string): Person<string>[];

    @put op replacePerson(@bodyRoot person: Person<int32>): Person<int32>;
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
