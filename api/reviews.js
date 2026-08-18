
import { createClient } from '@libsql/client';
import nodemailer from 'nodemailer';

// Initialize Turso Client
let dbClient;
try {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    dbClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
} catch (err) {
  console.error("Failed to initialize Turso client:", err);
}

// Initialize Nodemailer Transport
let transporter;
try {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
} catch (err) {
  console.error("Failed to initialize Nodemailer:", err);
}

export default async function handler(req, res) {
  // CORS setup for Serverless Functions
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, contact, q1, q2, body } = req.body;

  if (!name || !email || !q1 || !q2 || !body) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    // 1. Insert into Turso Database
    if (!dbClient) throw new Error("Database client not configured.");
    
    await dbClient.execute({
      sql: `INSERT INTO reviews (name, email, contact, q1, q2, body) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [name, email, contact || '', q1, q2, body]
    });

    // 2. Send Email Notification
    if (transporter && process.env.NOTIFICATION_EMAIL) {
      const mailOptions = {
        from: { name: 'Dashboard Feedback', address: process.env.SMTP_USER || 'kalinga@psa.gov.ph' },
        to: process.env.NOTIFICATION_EMAIL,
        subject: `New Dashboard Feedback from ${name}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="background-color: #10b981; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 25px -30px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Dashboard Feedback</h2>
            </div>
            
            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px;">
              <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">User Details</h3>
              <p style="margin: 8px 0; color: #334155;"><strong style="color: #0f172a; display: inline-block; width: 80px;">Name:</strong> ${name}</p>
              <p style="margin: 8px 0; color: #334155;"><strong style="color: #0f172a; display: inline-block; width: 80px;">Email:</strong> <a href="mailto:${email}" style="color: #10b981; text-decoration: none;">${email}</a></p>
              <p style="margin: 8px 0; color: #334155;"><strong style="color: #0f172a; display: inline-block; width: 80px;">Contact:</strong> ${contact || 'N/A'}</p>
            </div>

            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px;">
              <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Ratings</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #334155; font-weight: 500;">Usability & Performance (Q1):</span>
                <strong style="color: #10b981; font-size: 16px;">${q1} / 5</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #334155; font-weight: 500;">Value & Clarity (Q2):</span>
                <strong style="color: #10b981; font-size: 16px;">${q2} / 5</strong>
              </div>
            </div>

            <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Feedback Message</h3>
              <p style="color: #334155; line-height: 1.6; margin: 0; white-space: pre-wrap; font-style: italic;">"${body}"</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">This is an automated message from the Population Dashboard.</p>
            </div>
          </div>
        `
      };

      // Fire and forget
      transporter.sendMail(mailOptions).catch(err => console.error("Error sending email:", err));
    }

    res.status(200).json({ message: 'Review submitted successfully.' });

  } catch (error) {
    console.error("Error processing review:", error);
    res.status(500).json({ error: 'Failed to process the review.' });
  }
}
