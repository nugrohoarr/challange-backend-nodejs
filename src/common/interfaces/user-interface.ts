import { Request } from 'express';

export interface UserInterface extends Request {
  user: {
    id: string; 
  };
}