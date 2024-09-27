namespace People {
  model Person {
    firstName: string;
    lastName: string;
    pets: Pets.Pet[];
  }

  model Adult extends Person {
    age: int32;
  }

  op listPeople(sortBy?: string): Person;
}

namespace Pets {
  model Pet {
    name: string;
    owner?: People.Person;
  }
  op listPets(): Pet[];
}
