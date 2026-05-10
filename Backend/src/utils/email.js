const nodemailer = require('nodemailer');

class EmailUtil {
  constructor() {
    this.transporter = null;
    this._init();
  }

  async _init() {
    // If real SMTP credentials are provided, use them
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fall back to Ethereal test account
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log('📧 Ethereal test email account created:', testAccount.user);
      } catch (err) {
        console.error('Failed to create Ethereal test account:', err.message);
      }
    }
  }

  /**
   * Send an email.
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML body
   * @param {string} [options.text] - Plain text fallback
   */
  async send({ to, subject, html, text }) {
    if (!this.transporter) {
      console.warn('Email transporter not initialised. Skipping email.');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"AI-Solutions" <${process.env.SMTP_USER || 'noreply@ai-solutions.com'}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
      });

      console.log('✅ Email sent:', info.messageId);

      // Log preview URL for Ethereal
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📬 Preview URL:', previewUrl);
      }

      return info;
    } catch (err) {
      console.error('❌ Email send failed:', err.message);
      // Don't throw — email failure should not break the main request flow
    }
  }

  /**
   * Pre-built template: new inquiry notification to admin
   */
  newInquiryTemplate({ name, email, phone, company, country, jobTitle, jobDetails }) {
    return {
      to: process.env.ADMIN_EMAIL,
      subject: `New Inquiry from ${name}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #f9fafb; border-radius: 8px;">
          <h2 style="color: #0F172A;">New Contact Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: 600; color: #374151;">Name</td><td style="padding: 8px;">${name}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: 600; color: #374151;">Email</td><td style="padding: 8px;">${email}</td></tr>
            <tr><td style="padding: 8px; font-weight: 600; color: #374151;">Phone</td><td style="padding: 8px;">${phone || '—'}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: 600; color: #374151;">Company</td><td style="padding: 8px;">${company || '—'}</td></tr>
            <tr><td style="padding: 8px; font-weight: 600; color: #374151;">Country</td><td style="padding: 8px;">${country || '—'}</td></tr>
            <tr style="background:#fff;"><td style="padding: 8px; font-weight: 600; color: #374151;">Job Title</td><td style="padding: 8px;">${jobTitle}</td></tr>
            <tr><td style="padding: 8px; font-weight: 600; color: #374151; vertical-align: top;">Details</td><td style="padding: 8px;">${jobDetails}</td></tr>
          </table>
          <p style="margin-top: 24px; color: #6B7280; font-size: 12px;">AI-Solutions Admin Panel</p>
        </div>
      `,
    };
  }
}

module.exports = new EmailUtil();
