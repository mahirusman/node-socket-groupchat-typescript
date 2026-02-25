const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

const prepareTemplate = (subject, data) => {
  switch (subject) {
    case 'Reset password': {
      const emailTemplateSource = fs.readFileSync(
        path.join(__dirname, 'views/reset-password.hbs'),
        'utf8'
      );

      const template = handlebars.compile(emailTemplateSource);

      return template({
        message: data.message,
        link: data.link,
      });
    }
    default:
      return '';
  }
};

module.exports = prepareTemplate;
