namespace People {
  model Person <T>{
    firstName: string;
    lastName: string;
    pets: Pets.Pet[];
    special: T;
  }

  model Adult<T> extends Person<T> {
    age: int32;
  }

  model Adult2<T> extends Person<string> {
    age: T;
  }

  op listPeople(sortBy?: string): Person<string>;
}

namespace Pets {
  model Pet {
    name: string;
    owner?: People.Person<string>;
  }
  op listPets(): Pet[];
}
