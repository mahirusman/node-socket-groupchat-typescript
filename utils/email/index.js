const { MAIL_EMAIL, MAIL_PASSWORD } = process.env;
const nodemailer = require('nodemailer');
const prepareTemplate = require('./get-template');

exports.sendEmail = (recipient, subject, data) => {
  return new Promise((resolve, reject) => {
    const htmlToSend = prepareTemplate(subject, data);

    const mailOptions = {
      from: {
        name: 'Sales Manager',
        address: MAIL_EMAIL,
      },
      to: recipient,
      subject,
      html: htmlToSend,
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: MAIL_EMAIL,
        pass: MAIL_PASSWORD,
      },
    });

    transporter.sendMail(mailOptions, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
