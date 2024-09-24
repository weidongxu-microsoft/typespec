import "@typespec/http";
using TypeSpec.Http;
@service
namespace DemoService {
  @route("/people")
  namespace People {
    model Person<T> {
      @path id: int32;
      firstName: string;
      lastName: string;
      special: T;
      pets: Pets.Pet[];
    }

    @error
    model Error {
      code: int32;
      message: string;
    }

    @get op listPeople(): Person<string>[] | Error;
    @post op createPerson(@body person: Person<string>): OkResponse;
    @put op replacePerson(@bodyRoot person: Person<string>): Person<string>;
  }

  @route("/pets")
  namespace Pets {
    model Pet {
      name: string | int32;
      owner?: People.Person<int32>;
    }

    op listPets(): Pet[];
  }
}
