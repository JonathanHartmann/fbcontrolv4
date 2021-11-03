import https from 'https';
import fs from 'fs';
import path from 'path';
import { IRoom } from '../interfaces/room.interface';

export class FritzService {
  static async heatUpRoom(room: IRoom, sid: string): Promise<void> {
    //TODO: Print to File Ausgabe für weniger Logs. -> Datum Timestamp : Heat Up Room , Room.title 
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
          console.log('Recieved data from FritzBox for heating up room', room.title, ': ' , JSON.parse(data));
        });
      });
            //ToDo Noch auslagern in die file.service.ts
            const simplelogpath = process.env.simplelog_path;
            const date_controller = new Date().toISOString();
            const date = new Date();
            if (simplelogpath) {
              const filename = path.join(__dirname, simplelogpath);
              const simpledata = `${date} | Date Controller:${date_controller} | Heat Up room: ${room.title}, \n` ;
              fs.appendFile(filename, simpledata, () => { 
        
               });
            }
            //<<--
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
          console.log('Recieved data from FritzBox for cooling down room', room.title, ': ', JSON.parse(data));
        });
      });
      //ToDO Noch auslagern in die file.service.ts
      const simplelogpath = process.env.simplelog_path;
      const date_controller = new Date().toISOString();
      const date = new Date();
      if (simplelogpath) {
        const filename = path.join(__dirname, simplelogpath);
        const simpledata = `${date} | Date Controller:${date_controller} | Cool down room: ${room.title}, \n` ;
        fs.appendFile(filename, simpledata, () => { 
  
         });
      }
    }
  }

}