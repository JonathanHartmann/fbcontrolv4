import fs from 'fs';
import path from 'path';

export class SIDService {
  static readSIDFile(cb: (err: NodeJS.ErrnoException | null, sid: string) => void): void {
    const filename = path.join(__dirname, '../../sid.txt');
    fs.readFile(filename, 'utf8', cb);
  }

  static requestNewSID() {
    // TODO trigger php route for new SID
    const filename = path.join(__dirname, '../../sid.txt');
    fs.writeFile(filename, '', () => {
      console.log('Cleared file, waiting now for new SID!')
      console.log('Request new SID...');
    });
  }
}