import "@typespec/http";

using TypeSpec.Http;

@service
namespace DemoService;
model Pet {
  name: string;
  tag?: string;
  age: int32;
}

model Toy {
  id: int64;
  petId: int64;
  name: string;
}

@error
model Error {
  code: int32;
  message: string;
}


model ResponsePage<Item> {
  items: Item[];
  nextLink?: string;
}

model PetId {
  @path petId: int32;
  @header header: string;
  @query query: string;
}

@route("/pets")
namespace Pets {

  @delete op delete(...PetId): OkResponse | NoContentResponse | Error;

  op list(@query nextLink?: string): ResponsePage<Pet> | Error;

  op read(...PetId): Pet | Error;

  @post op create(@body pet: Pet): Pet | Error;
}

@route("/pets/{petId}/toys")
namespace ListPetToys {
  op list(@path petId: string, @query nameFilter: string): ResponsePage<Toy> | Error;
}
