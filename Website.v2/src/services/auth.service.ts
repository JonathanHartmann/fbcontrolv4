import { firebaseAuth } from '../client-packages/firebase';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, Unsubscribe, User } from 'firebase/auth';
import { IUser, ROLE } from '../interfaces/user.interface';
import { UserService } from './user.service';
import { clearStore } from '../redux/actions/clear.actions';
import { userLogin } from '../redux/actions/user.actions';
import { store } from '../redux/store';

export class AuthService {

  static async register(email: string, password: string, name: string): Promise<IUser | undefined> {
    let userCred = undefined;
    try {
      userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error) {
      console.error('Error by user registration:', error);
      throw new Error(error);
    }
    if (userCred.user.email) {
      const userData = {
        id: userCred.user.uid,
        name,
        email: userCred.user.email,
        createdAt: userCred.user.metadata.creationTime,
        role: ROLE.USER
      }
      const user = await UserService.create(userData);
      store.dispatch(userLogin(user))
      return user;
    } else {
      return undefined;
    }
  }
  
  static async login(email: string, password: string): Promise<IUser | undefined> {
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const user = await UserService.getUser(cred.user.uid);
    console.log(cred);
    if (user) {
      store.dispatch(userLogin(user));
      return user;
    } else {
      return undefined;
    }
  }
  
  static async logout(): Promise<boolean> {
    try {
      await signOut(firebaseAuth);
      store.dispatch(clearStore());
      return true;
    } catch (error) {
      console.error('Error by log out:', error);
      return false;
    }
  }

  static onUserChange(cb: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(firebaseAuth, cb);
  }
}