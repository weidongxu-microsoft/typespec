import "@typespec/http";
using TypeSpec.Http;
@service
namespace DemoService {

  @route("/people")
  namespace People {
    model Person<T> {
      firstName: string;
      lastName: string;
      special: T;
      pets: Pets.Pet[];
    }

    op listPeople(sortBy?: string): Person<string>[];
  }

  // This will generate a RestController for the /pets endpoint
  @route("/pets")
  namespace Pets {
    // Just defined inside package
    model Pet {
      name: string;
      owner?: People.Person<int32>;
    }

    // This is default get, will generate a RouteHandler for '/'
    op listPets(): Pet[];
  }
}
