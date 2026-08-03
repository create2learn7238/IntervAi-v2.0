const nodemailer = require('nodemailer');

exports.sendInterviewReport = async (recipient, { jobposition, overallRating, fillerWordCount, tone }) => {
    let transporter;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: '"IntervAI Career Coach" <noreply@intervai.app>',
      to: recipient,
      subject: `🏆 IntervAI Mock Interview Report — ${jobposition || 'Software Engineer'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FAFAFC;">
          <h2 style="color: #4F46E5; margin-bottom: 8px;">IntervAI Evaluation Report</h2>
          <p style="color: #475569; font-size: 14px;">Mock session results for <strong>${jobposition || 'Software Engineer'}</strong>:</p>
          
          <div style="background-color: #FFFFFF; padding: 18px; border-radius: 10px; margin: 20px 0; border: 1px solid #E2E8F0;">
            <h3 style="margin: 0; color: #0F172A; font-size: 20px;">Overall Score: <span style="color: #10B981;">${overallRating || '0.0'}/10</span></h3>
            <p style="margin: 8px 0 0 0; color: #64748B; font-size: 13px;">Filler Words Detected: <strong>${fillerWordCount || 0}</strong></p>
            <p style="margin: 4px 0 0 0; color: #64748B; font-size: 13px;">Tone Analysis: <strong>${tone || 'Standard'}</strong></p>
          </div>

          <h4 style="color: #0F172A; margin-bottom: 6px;">Key Preparation Guidance:</h4>
          <ul style="color: #475569; font-size: 13px; line-height: 1.6; padding-left: 20px;">
            <li>Structure technical responses using Situation, Task, Action, Result (STAR).</li>
            <li>Maintain steady pacing and direct camera contact during responses.</li>
          </ul>

          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94A3B8; text-align: center;">© 2026 IntervAI Inc. — AI Career Preparation Platform</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    if (previewUrl) {
      console.log('Ethereal test email preview URL:', previewUrl);
    }
    
    return previewUrl;
};
