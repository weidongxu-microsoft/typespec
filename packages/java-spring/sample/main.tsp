namespace People {
  model Person <T>{
    firstName: string;
    lastName: string;
    pets: Pets.Pet[];
    special: T;
  }

  model Adult extends Person<int32> {
    age: int32;
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
