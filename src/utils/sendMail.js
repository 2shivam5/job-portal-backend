
import nodemailer from "nodemailer";

export const sendMail = async ({ to, subject, text, attachments = [] }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.verify();

  return transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
    attachments,
  });
};
