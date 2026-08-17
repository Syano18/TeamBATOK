require('dotenv').config();
const { createClient } = require('@libsql/client');
const nodemailer = require('nodemailer');

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
        from: process.env.SMTP_FROM || `"Dashboard Reviews" <${process.env.SMTP_USER}>`,
        to: process.env.NOTIFICATION_EMAIL,
        subject: `New Dashboard Review from ${name}`,
        html: `
          <h2>New Dashboard Review Received</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Contact:</strong> ${contact || 'N/A'}</p>
          <hr/>
          <h3>Ratings</h3>
          <p><strong>Usability & Performance (Q1):</strong> ${q1} / 5</p>
          <p><strong>Value & Clarity (Q2):</strong> ${q2} / 5</p>
          <hr/>
          <h3>Feedback</h3>
          <p>${body}</p>
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
