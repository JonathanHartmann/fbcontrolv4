import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
// const nodemailer = require("nodemailer");

const hostname = process.env.mail_hostname;
const port = process.env.mail_port;
const secure = process.env.mail_secure;
const requireTLS = process.env.mail_requireTLS;
const user = process.env.mail_user;
const displayname = process.env.mail_displayname;
const pass = process.env.mail_password;
const receiver = process.env.mail_receiver;


export class Sendmail{   
async sendmail(title, description) {

  const transporter = nodemailer.createTransport({
    host: hostname,
    port: port,
    secure: secure,
    requireTLS: requireTLS,
    auth: {
      user: user,
      pass: pass,
    },
    logger: true
  });
          // Inhalt der Mail: Neue Veranstaltung erstellt von [] 
          // Name: [createdFrom] 
          // Datum/Uhrzeit: [start, end]
          // Raum: [room]
          // Beschreibung: [description]
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: displayname + '<' + user + '>',
        //from: '"Sender Name" <from@example.net>',
        to: receiver,
        subject: "Raumbuchung: Neue Veranstaltung wurde hinzugefügt",
        text: "Hello world?",
        html: "<strong>Hello world?</strong>",
        headers: { 'x-myheader': 'test header' }
      });
    
      //console.log("Message sent: %s", info.response);
    }}
