let sendEmail;

try {
  const nodemailer = require('nodemailer');

  const MAIL_HOST = process.env.MAIL_HOST || '';
  const MAIL_PORT = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587;
  const MAIL_USER = process.env.MAIL_USER || '';
  const MAIL_PASS = process.env.MAIL_PASS || '';
  const MAIL_FROM = process.env.MAIL_FROM || MAIL_USER || 'no-reply@example.com';

  // If SMTP credentials are not provided, export a noop sender.
  if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS) {
    console.warn('sendEmail: SMTP no configurado. Los correos no se enviarán.');
    sendEmail = async (opts) => {
      console.log('sendEmail noop:', opts && { to: opts.to, subject: opts.subject });
      return { info: 'noop' };
    };
  } else {
    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: MAIL_PORT === 465,
      auth: { user: MAIL_USER, pass: MAIL_PASS },
    });

    sendEmail = async ({ to, subject, html, text, replyTo }) => {
      if (!to) throw new Error('Missing "to" address');

      const info = await transporter.sendMail({
        from: MAIL_FROM,
        to,
        subject: subject || 'Mensaje desde SWES',
        html: html || undefined,
        text: text || undefined,
        replyTo: replyTo || undefined,
      });

      return info;
    };
  }
} catch (err) {
  // nodemailer not installed or other error — fallback noop
  console.warn('sendEmail: nodemailer no disponible, fallback noop.', err && err.message);
  sendEmail = async (opts) => {
    console.log('sendEmail fallback noop:', opts && { to: opts.to, subject: opts.subject });
    return { info: 'noop' };
  };
}

module.exports = { sendEmail };
