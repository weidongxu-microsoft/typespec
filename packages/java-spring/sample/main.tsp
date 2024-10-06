namespace People {
  model Person<T> {
    firstName: string;
    lastName: string;
    special: T;
    pets: Pets.Pet[];
  }

enum Foo {
  One: 1,
  Ten: 10,
  Hundred: 100,
  Thousand: 1000,
}

  op listPeople(sortBy?: string): Person<string>[];
}

namespace Pets {
  model Pet {
    name: string;
    owner?: People.Person<int32>;
  }
  op listPets(): Pet[];
}
