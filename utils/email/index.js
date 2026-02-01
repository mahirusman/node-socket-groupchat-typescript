const { MAIL_EMAIL, MAIL_PASSWORD } = process.env;
const nodemailer = require('nodemailer');
const PrepareTemplete = require('./Gettemplate');

exports.sendEmail = (recipient, subject, data) => {
  return new Promise((resolve, reject) => {
    const htmlToSend = PrepareTemplete(subject, data);

    const mailOption = {
      from: {
        name: 'Sales Manager',
        address: MAIL_EMAIL,
      },
      to: recipient,
      subject: subject,
      html: htmlToSend,
    };

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: MAIL_EMAIL,
        pass: MAIL_PASSWORD,
      },
    });

    transporter.sendMail(mailOption, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
