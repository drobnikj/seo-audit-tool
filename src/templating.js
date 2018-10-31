const Handlebars = require('handlebars');
const fs = require('fs');

function generateReport(context) {
    const html = fs.readFileSync('./src/templates/report.hbs').toString();
    const template = Handlebars.compile(html);
    return template(context);
};

function generateIndex(context) {
    const html = fs.readFileSync('./src/templates/landing.hbs').toString();
    const template = Handlebars.compile(html);
    return template(context);
};

module.exports = {
    generateReport,
};
