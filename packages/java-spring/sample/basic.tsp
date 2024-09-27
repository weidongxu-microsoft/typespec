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
    model CustomError {
      @statusCode _: 400;
      code: int32;
      message: string;
    }

    @get op getPerson(@path id: int32): Person<string> | NotFoundResponse | CustomError;
    @get op listPeople(): Person<string>[] | CustomError;
    @post op createPerson(@body person: Person<string>): CreatedResponse | CustomError;
    @put op replacePerson(@bodyRoot person: Person<string>): OkResponse | CustomError;
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
