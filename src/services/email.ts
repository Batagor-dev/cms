import nodemailer from 'nodemailer'

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export function getEmailTransporter() {
  const host = process.env.MAIL_HOST || 'smtp.gmail.com'
  const port = Number(process.env.MAIL_PORT) || 465
  const user = process.env.MAIL_USERNAME || 'techareaproduction@gmail.com'
  const pass = process.env.MAIL_PASSWORD || ''

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const fromAddress =
    process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || 'techareaproduction@gmail.com'
  const fromName = process.env.MAIL_FROM_NAME || 'CMS'
  const transporter = getEmailTransporter()

  return await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  })
}
