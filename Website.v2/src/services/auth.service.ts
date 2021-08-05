import { firebaseAuth } from '../client-packages/firebase';
import { signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, Unsubscribe, User, deleteUser } from 'firebase/auth';
import { IUser, ROLE } from '../interfaces/user.interface';
import { UserService } from './user.service';
import { clearStore } from '../redux/actions/clear.actions';
import { userLogin } from '../redux/actions/user.actions';
import { store } from '../redux/store';

export class AuthService {

  static async register(email: string, password: string, name: string): Promise<void> {
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
        role: ROLE.INACTIVE
      }
      await UserService.create(userData);
    }
  }
  
  static async login(email: string, password: string): Promise<IUser | undefined> {
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const user = await UserService.getUser(cred.user.uid);
    if (user) {
      store.dispatch(userLogin({...user, id: cred.user.uid}));
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

  static async deleteUser(): Promise<void> {
    const user = firebaseAuth.currentUser;
    if (user) {
      try {
        deleteUser(user);
      } catch(e) {
        throw new Error('Error by deleting Auth-User: ' + e);
      }
    }
  }
}