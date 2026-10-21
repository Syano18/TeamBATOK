import { createClient } from '@libsql/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure .env is loaded
dotenv.config();

function getDbClient() {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    return createClient({
      url: process.env.TURSO_DATABASE_URL.trim(),
      authToken: process.env.TURSO_AUTH_TOKEN.trim(),
    });
  }
  return null;
}

function getTransporter() {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  if (!user || !pass) return null;

  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user, pass },
  });
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

  const { name, email, contact, q1, q2, body } = req.body || {};

  if (!name || !q1 || !q2) {
    return res.status(400).json({ error: 'Missing required fields (name, ratings).' });
  }

  try {
    // 1. Insert into Turso Database
    const dbClient = getDbClient();
    if (!dbClient) throw new Error("Database client not configured.");
    
    await dbClient.execute({
      sql: `INSERT INTO reviews (name, email, contact, q1, q2, body) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [name, email || '', contact || '', Number(q1), Number(q2), body || '']
    });

    // 2. Send Email Notification
    const notificationEmail = (process.env.NOTIFICATION_EMAIL || '').replace(/^["']|["']$/g, '').trim();
    if (notificationEmail) {
      try {
        const transporter = getTransporter();
        if (transporter) {
          const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
          const isValidEmail = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

          const safeName = esc(name);
          const safeEmail = email && isValidEmail(email)
            ? `<a href="mailto:${encodeURIComponent(email.trim())}" style="color: #10b981; text-decoration: none;">${esc(email.trim())}</a>`
            : (email ? esc(email) : 'N/A');
          const safeContact = contact ? esc(contact) : 'N/A';
          const safeBody = body ? esc(body) : 'No additional comments provided.';
          const safeQ1 = Number(q1);
          const safeQ2 = Number(q2);

          const fromAddress = process.env.SMTP_FROM || `"Dashboard Feedback" <${process.env.SMTP_USER.trim()}>`;
          const mailOptions = {
            from: fromAddress,
            to: notificationEmail,
            subject: `New Dashboard Feedback from ${safeName}`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="background-color: #10b981; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 25px -30px; text-align: center;">
                  <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Dashboard Feedback</h2>
                </div>
                
                <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px;">
                  <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">User Details</h3>
                  <p style="margin: 8px 0; color: #334155;"><strong style="color: #0f172a; display: inline-block; width: 80px;">Name:</strong> ${safeName}</p>
                  <p style="margin: 8px 0; color: #334155;"><strong style="color: #0f172a; display: inline-block; width: 80px;">Email:</strong> ${safeEmail}</p>
                  <p style="margin: 8px 0; color: #334155;"><strong style="color: #0f172a; display: inline-block; width: 80px;">Contact:</strong> ${safeContact}</p>
                </div>

                <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 20px;">
                  <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Ratings</h3>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #334155; font-weight: 500;">Usability & Performance (Q1):</span>
                    <strong style="color: #10b981; font-size: 16px;">${safeQ1} / 5</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: #334155; font-weight: 500;">Value & Clarity (Q2):</span>
                    <strong style="color: #10b981; font-size: 16px;">${safeQ2} / 5</strong>
                  </div>
                </div>

                <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                  <h3 style="color: #0f172a; margin-top: 0; margin-bottom: 15px; font-size: 18px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Feedback Message</h3>
                  <p style="color: #334155; line-height: 1.6; margin: 0; white-space: pre-wrap; font-style: italic;">"${safeBody}"</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <p style="font-size: 12px; color: #94a3b8; margin: 0;">This is an automated message from the Population Dashboard.</p>
                </div>
              </div>
            `
          };

          const info = await transporter.sendMail(mailOptions);
          console.log("Feedback notification email sent successfully:", info.messageId);
        } else {
          console.warn("SMTP credentials not configured, skipped sending email.");
        }
      } catch (emailErr) {
        console.error("Error sending notification email:", emailErr);
      }
    }

    res.status(200).json({ message: 'Review submitted successfully.' });

  } catch (error) {
    console.error("Error processing review:", error);
    res.status(500).json({ error: 'Failed to process the review.' });
  }
}
