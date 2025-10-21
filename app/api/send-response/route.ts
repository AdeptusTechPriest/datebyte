// /app/api/send-response/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || !emailPass) {
    console.error('❌ Missing EMAIL_USER or EMAIL_APP_PASSWORD');
    return NextResponse.json({ success: false, error: 'Missing email credentials' }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: emailUser, pass: emailPass },
  });

  try {
    const data = await request.json();
    const info = await transporter.sendMail({
      from: emailUser,
      to: emailUser,
      subject: '💕 New Date Response!',
      html: `
        <h1>She responded!</h1>
        <p><b>Date:</b> ${new Date(data.date).toLocaleDateString()}</p>
        <p><b>Time:</b> ${data.time}</p>
        <p><b>Place:</b> ${data.food?.join(', ')}</p>
        <p><b>Excitement:</b> ${data.excitement}/100</p>
      `,
      attachments: [
        {
          filename: `date-response-${new Date().toISOString()}.json`,
          content: JSON.stringify(data, null, 2),
          contentType: 'application/json',
        },
      ],
    });

    console.log('✅ Email sent:', info.messageId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Failed to send email:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
