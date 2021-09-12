import { createDecipheriv } from 'crypto';
import fs from 'fs';
import path from 'path';

export class SIDService {
  static readSIDFile(cb: (err: NodeJS.ErrnoException | null, sid: string) => void): void {
    const sidPath = process.env.SID_FILE;
    if (sidPath) {
      const filename = path.join(__dirname, sidPath);
      fs.readFile(filename, 'utf16le', (err: NodeJS.ErrnoException | null, data: string) => {
        if (process.env.SID_KEY) {
          const sid = SIDService.decrypt(data, process.env.SID_KEY);
          cb(err, sid);
        }
      });
    }
  }

  static requestNewSID() {
    const sidPath = process.env.SID_FILE;
    if (sidPath) {
      const filename = path.join(__dirname, sidPath);
      fs.writeFile(filename, '', () => {
        console.log('Cleared file, waiting now for new SID!')
        console.log('Request new SID...');
      });
    }
  }

  private static decrypt(cipherText: string, key: string) {
    const mykey = createDecipheriv('aes-128-ecb', key, null);
    const mystr = mykey.update(cipherText, 'base64', 'utf8');
    return mystr;
  }
}