import https from 'https';
import { IRoom } from '../interfaces/room.interface';
import { SimpleLog } from './file.service';

export class FritzService {
  static heatUpRoom(room: IRoom, sid: string): void {
    console.log('🔼 Heat up room: ', room.title);
    const baseUrl = process.env.FRITZ_ADDRESS;
    const roomId = room.fritzId;
    const temp = room.comfortTemp;
    const url = `${baseUrl}/webservices/homeautoswitch.lua?sid=${sid}&ain=${roomId}&switchcmd=sethkrtsoll&param=${temp * 2}`;
    console.log('call: ', url);
    const prodMode = process.env.MODE;
    if (prodMode === 'prod' && temp != 0) {
      https.get(url, (res) => {
        let data = '';
        // A chunk of data has been received.
        res.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. Print out the result.
        res.on('end', () => {
          const state = 'Heat up  ';
          const jsonData = JSON.parse(data);
          console.log('Recieved data from FritzBox for heating up room', room.title, ': ', jsonData);
          SimpleLog.writeSimpleLog(room.title, temp * 2, jsonData, state);
        });
      });
    }
  }

  static coolDownRoom(room: IRoom, sid: string): void {
    console.log('🔽 Cool down room: ', room.title);
    const baseUrl = process.env.FRITZ_ADDRESS;
    const roomId = room.fritzId;
    const temp = room.emptyTemp;
    const url = `${baseUrl}/webservices/homeautoswitch.lua?sid=${sid}&ain=${roomId}&switchcmd=sethkrtsoll&param=${temp * 2}`;
    console.log('call: ', url);
    const prodMode = process.env.MODE;
    if (prodMode === 'prod' && temp != 0) {
      https.get(url, (res) => {
        let data = '';
        // A chunk of data has been received.
        res.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. Print out the result.
        res.on('end', () => {
          const state = 'Cool down';
          const jsonData = JSON.parse(data);
          console.log('Recieved data from FritzBox for cooling down room', room.title, ': ', jsonData);
          SimpleLog.writeSimpleLog(room.title, temp * 2, jsonData, state);
        });
      });
    }
  }
}
