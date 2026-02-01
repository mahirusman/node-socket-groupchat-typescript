const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const PrepareTemplete = (subject, data) => {
  switch (subject) {
    case 'Reset password':
      const emailTemplateSource = fs.readFileSync(
        path.join(__dirname + '/views/resetPassword.hbs'),
        'utf8'
      );

      const template = handlebars.compile(emailTemplateSource);

      const htmlToSend = template({
        message: data.message,
        link: data.link,
      });
      return htmlToSend;

    default:
      break;
  }
};

module.exports = PrepareTemplete;
