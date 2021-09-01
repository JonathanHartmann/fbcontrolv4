import fs from 'fs';
import path from 'path';

export class SIDService {
  static readSIDFile(cb: (err: NodeJS.ErrnoException | null, sid: string) => void): void {
    const sidPath = process.env.SID_FILE;
    if (sidPath) {
      const filename = path.join(__dirname, sidPath);
      fs.readFile(filename, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
        const sid = data; // TODO entschluesseln!
        cb(err, sid);
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
}