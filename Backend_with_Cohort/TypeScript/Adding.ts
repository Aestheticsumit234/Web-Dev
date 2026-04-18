function Add(a: number, b: number) {
  return a + b;
}

console.log(Add(2, 2));

type UserId = string;

interface User {
  id: UserId;
  name: string;
  age: number;
  email: string;
  password: string;
  contsct: {
    mobile: string;
  };
  address: {
    city: string;
    state: string;
    country: string;
  };
}

class inMemoryDB {
  private _db: Map<UserId, User>;

  constructor() {}

  public insertUser(data: User): UserId {
    if (this._db.has(data.id)) {
      throw new Error(`User already exists ${data.id} ${data.name}`);
    }

    this._db.set(data.id, data);
    return data.id;
  }
}
