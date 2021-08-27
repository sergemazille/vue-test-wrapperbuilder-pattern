import users from '@/assets/users.json';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
}

export class UserService {
  findById(id: number): User {
    const user = users.find((user: User) => user.id === id);

    if (!user) {
      throw new Error('No user has been found');
    }

    return user;
  }
}
