import { firestore } from '../client-packages/firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { IUser } from '../interfaces/user.interface';

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
    } catch(e) {
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
      console.log('No such document!');
      return undefined;
    }
  }
}
