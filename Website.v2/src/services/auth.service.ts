import { firebaseAuth, firestore } from '../client-packages/firebase';
import { signOut, User, UserCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { IUser } from '../interfaces/user.interface';

export class AuthService {

  static async register(email: string, password: string, name: string): Promise<IUser> {
    const authUser = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const userCol = collection(firestore, 'users');
    const newUserDoc = doc(userCol, authUser.user.uid);
    const userData = {
      name,
      email: authUser.user.email!,
      createdAt: authUser.user.metadata.creationTime
    }
    setDoc(newUserDoc, userData);
    return { ...userData, id: authUser.user.uid};
  }
  
  static login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  }
  
  static firebaseSignOut(): Promise<void> {
    return signOut(firebaseAuth);
  }
}

export { User };