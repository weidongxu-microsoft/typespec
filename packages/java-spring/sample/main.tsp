namespace People {
  model Person<T> {
    firstName: string;
    lastName: string;
    special: T;
    pets: Pets.Pet[];
  }

  enum Direction {
    North,
    East,
    South,
    West,
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
