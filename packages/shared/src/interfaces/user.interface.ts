import { Role } from '../enums/role.enum';

export interface IUser {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}
