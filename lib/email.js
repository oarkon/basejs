const config = require('config');
const logger = require('./logger');

// Do not load module if no configuration
if (!config.email) return logger.warn('Email module not configured, Skipping');

const app = require('../app');
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({ service: config.email.service }, config.email);

// Promisify
const render = Promise.promisify(app.render, { context: app });
const sendMail = Promise.promisify(transporter.sendMail, { context: transporter });

// Send email
function send(options = {}, data = {}) {
	// Default template
	options.template = options.template || config.email.template;

	// Render template into html
	return render('emails/' + options.template, data).then(html => {
		options.html = html;

		// Send email
		return sendMail(options);
	});
}

module.exports = { send };
