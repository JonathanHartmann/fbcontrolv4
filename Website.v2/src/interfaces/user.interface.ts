export interface IUser {
  id: string;
  name: string;
  email: string;
  role: ROLE;
  createdAt?: string;
}

export enum ROLE { ADMIN = 'admin', ACTIVATED = 'activated', INACTIVE = 'inactive' }