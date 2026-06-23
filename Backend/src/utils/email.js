const nodemailer = require('nodemailer');

const REQUIRED_SMTP_KEYS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'ADMIN_EMAIL',
];

const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => {
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return entities[char];
});

const sanitizeSubjectPart = (value, fallback = 'Customer') =>
  String(value || fallback).replace(/[\r\n]+/g, ' ').trim().slice(0, 100);

class EmailUtil {
  constructor() {
    this.transporter = this.createTransporter();
  }

  getMissingKeys() {
    return REQUIRED_SMTP_KEYS.filter((key) => !process.env[key]);
  }

  createTransporter() {
    const missingKeys = this.getMissingKeys();

    if (missingKeys.length > 0) {
      console.warn(
        `[email] SMTP disabled. Missing environment variable(s): ${missingKeys.join(', ')}`
      );
      return null;
    }

    if (/ethereal/i.test(process.env.SMTP_HOST)) {
      console.warn('[email] Ethereal SMTP is disabled. Configure a real SMTP provider.');
      return null;
    }

    const port = Number(process.env.SMTP_PORT);
    if (!Number.isInteger(port) || port <= 0) {
      console.warn('[email] SMTP disabled. SMTP_PORT must be a valid port number.');
      return null;
    }

    const secure = process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  ensureConfigured() {
    if (this.transporter) return;

    const missingKeys = this.getMissingKeys();
    const reason = missingKeys.length > 0
      ? `Missing environment variable(s): ${missingKeys.join(', ')}`
      : 'Ethereal SMTP is not allowed. Use a real SMTP provider.';

    const err = new Error(`Email delivery is not configured. ${reason}`);
    err.statusCode = 500;
    throw err;
  }

  getFromAddress() {
    const fromName = process.env.SMTP_FROM_NAME || 'AI-Solutions';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
    return `"${fromName}" <${fromEmail}>`;
  }

  async verify() {
    this.ensureConfigured();
    await this.transporter.verify();
    console.log(`[email] SMTP ready: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  }

  /**
   * Send a real SMTP email.
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML body
   * @param {string} [options.text] - Plain text fallback
   * @param {string} [options.replyTo] - Reply-to address
   */
  async send({ to, subject, html, text, replyTo }) {
    this.ensureConfigured();

    if (!to) {
      const err = new Error('Email recipient is required');
      err.statusCode = 500;
      throw err;
    }

    const info = await this.transporter.sendMail({
      from: this.getFromAddress(),
      to,
      subject,
      html,
      text: text || String(html || '').replace(/<[^>]+>/g, ''),
      replyTo,
    });

    console.log(`[email] Sent "${subject}" to ${to}. Message ID: ${info.messageId}`);
    return info;
  }

  /**
   * Pre-built template: new inquiry notification to admin.
   */
  newInquiryTemplate({
    name,
    email,
    phone,
    companyName,
    country,
    jobTitle,
    jobDetails,
  }) {
    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone || '-'),
      companyName: escapeHtml(companyName),
      country: escapeHtml(country || '-'),
      jobTitle: escapeHtml(jobTitle),
      jobDetails: escapeHtml(jobDetails),
    };

    return {
      to: process.env.ADMIN_EMAIL,
      subject: `New Inquiry from ${sanitizeSubjectPart(name)}`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; color: #0f172a;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h2 style="margin: 0 0 8px; font-size: 22px;">New Contact Inquiry</h2>
            <p style="margin: 0 0 24px; color: #475569;">A customer submitted the AI-Solutions contact form.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 10px; font-weight: 700; background: #f8fafc;">Name</td><td style="padding: 10px;">${safe.name}</td></tr>
              <tr><td style="padding: 10px; font-weight: 700; background: #f8fafc;">Email</td><td style="padding: 10px;">${safe.email}</td></tr>
              <tr><td style="padding: 10px; font-weight: 700; background: #f8fafc;">Phone</td><td style="padding: 10px;">${safe.phone}</td></tr>
              <tr><td style="padding: 10px; font-weight: 700; background: #f8fafc;">Company</td><td style="padding: 10px;">${safe.companyName}</td></tr>
              <tr><td style="padding: 10px; font-weight: 700; background: #f8fafc;">Country</td><td style="padding: 10px;">${safe.country}</td></tr>
              <tr><td style="padding: 10px; font-weight: 700; background: #f8fafc;">Job Title</td><td style="padding: 10px;">${safe.jobTitle}</td></tr>
              <tr><td style="padding: 10px; font-weight: 700; background: #f8fafc; vertical-align: top;">Details</td><td style="padding: 10px; white-space: pre-line;">${safe.jobDetails}</td></tr>
            </table>
            <p style="margin: 24px 0 0; color: #64748b; font-size: 12px;">AI-Solutions Admin Notification</p>
          </div>
        </div>
      `,
    };
  }
}

module.exports = new EmailUtil();
module.exports.escapeHtml = escapeHtml;
