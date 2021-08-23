import { firestore } from '../client-packages/firebase';
import { collection, deleteDoc, doc, DocumentData, getDoc, getDocs, QuerySnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { IUser } from '../interfaces/user.interface';
import { AuthService } from './auth.service';

export class UserService {

  static async create(user: IUser): Promise<IUser> {
    const userCol = collection(firestore, 'users');
    const newUserDoc = doc(userCol, user.id);
    const userData = {
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
    try {
      await setDoc(newUserDoc, userData);
      return user;
    } catch (e) {
      console.error('Error by creating user in Firestore: ', e);
      throw new Error(e);
    }
  }

  static async getUser(id: string): Promise<IUser | undefined> {
    const docRef = doc(firestore, 'users', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as IUser;
    } else {
      // doc.data() will be undefined in this case
      console.error('No such document!');
      return undefined;
    }
  }

  static async getAllUser(): Promise<IUser[] | undefined> {
    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);
    const users = UserService.getDataFromSnapshot(snapshot);

    if (users.length > 0) {
      return users as IUser[];
    } else {
      // doc.data() will be undefined in this case
      console.error('No users found!');
      return undefined;
    }
  }

  static async updateUser(user: IUser): Promise<void> {
    const docRef = doc(firestore, 'users', user.id);
    await updateDoc(docRef, user);
  }

  static async deleteUser(userId: IUser['id']): Promise<void> {
    const userRef = doc(firestore, 'users/' + userId);
    try {
      await deleteDoc(userRef);
      await AuthService.deleteUser()
    } catch(e) {
      throw new Error(e);
    }
  }

  private static getDataFromSnapshot(snapshot: QuerySnapshot<DocumentData>): DocumentData[] {
    return snapshot.docs.map(value => {
      return { ...value.data(), id: value.id };
    });
  }
}