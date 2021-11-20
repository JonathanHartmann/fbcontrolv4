import { createDecipheriv } from 'crypto';
import fs from 'fs';
import path from 'path';

export class SIDService {
  static readSIDFile(cb: (err: NodeJS.ErrnoException | null, sid: string) => void): void {
    const sidPath = process.env.SID_FILE;
    if (sidPath) {
      const filename = path.join(__dirname, sidPath);
      fs.readFile(filename, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
        console.log('Encrypt SID ', data);
        if (process.env.SID_KEY) {
          const sid = SIDService.decrypt(data, process.env.SID_KEY);
         // console.log('Decrypt SID ', sid);
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

export class SimpleLog {
  static writeSimpleLog(roomTitle: string, expectedTemp?: number, fritzBoxTemp?: number, state?: string, others?: string) {
    const simplelogpath = process.env.simplelog_path;
    const date_controller = new Date().toISOString();
    const date = new Date();
    if (simplelogpath) {
      const filename = path.join(__dirname, simplelogpath);
      let simpledata = `${date} | Date Controller:${date_controller} | ${state} room: ${roomTitle} | send: ${expectedTemp} | return: ${fritzBoxTemp}` ;
      if (others) {
        simpledata += ' | ' + others;
      }
      simpledata += '\n';
      fs.appendFile(filename, simpledata, () => {
        // Hier kommt Logik rein, die Ausgeführt wird, wenn simpledata an die Datei angehangen wurde.
      });
    }
  }
}