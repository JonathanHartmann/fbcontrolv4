import https from 'https';

import { IRoom } from '../interfaces/room.interface';

export class FritzService {
  static async heatUpRoom(room: IRoom, sid: string): Promise<void> {
    console.log('🔼 Heat up room: ', room.title);
    const baseUrl = process.env.FRITZ_ADDRESS;
    const roomId = room.fritzId;  
    const temp = room.comfortTemp;
    const url = `${baseUrl}/webservices/homeautoswitch.lua?sid=${sid}&ain=${roomId}&switchcmd=sethkrtsoll&param=${temp * 2}`;
    console.log('call: ', url);
    const prodMode = process.env.MODE;
    if (prodMode === 'prod') {
      https.get(url, (res) => {
        let data = '';
        // A chunk of data has been received.
        res.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. Print out the result.
        res.on('end', () => {
          console.log('Recieved data from FrtizBox for heating up room', room.title, ':');
          console.log(JSON.parse(data));
        });
      });
    }
  }
  
  static async coolDownRoom(room: IRoom, sid: string): Promise<void> {
    console.log('🔽 Cool down room: ', room.title);
    const baseUrl = process.env.FRITZ_ADDRESS;
    const roomId = room.fritzId;  
    const temp = room.emptyTemp;
    const url = `${baseUrl}/webservices/homeautoswitch.lua?sid=${sid}&ain=${roomId}&switchcmd=sethkrtsoll&param=${temp * 2}`;
    console.log('call: ', url);
    const prodMode = process.env.MODE;
    if (prodMode === 'prod') {
      https.get(url, (res) => {
        let data = '';
        // A chunk of data has been received.
        res.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. Print out the result.
        res.on('end', () => {
          console.log('Recieved data from FrtizBox for cooling down room', room.title, ':');
          console.log(JSON.parse(data));
        });
      });
    }
  }
}