import Mailgen from "mailgen";
import nodemailer from "nodemailer";

export const sendMail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Authentication",
      link: "https://yourapp.com/",
    },
  });

  const emailText = mailGenerator.generatePlaintext(options.mailGenContent);
  const emailHtml = mailGenerator.generate(options.mailGenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT || 587,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAILTRAP_SENDEREMAIL,
    to: options.email,
    subject: options.subject,
    text: emailText,
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);
};

export const emailVerificationMailGenContent = (username, verificationUrl) => ({
  body: {
    name: username,
    intro:
      "Welcome to our app! Please verify your email to activate your account.",
    action: {
      instructions: "Click the button below to verify your email:",
      button: {
        color: "#22BC66",
        text: "Verify Email",
        link: verificationUrl,
      },
    },
    outro: "If you did not sign up, please ignore this email.",
  },
});

export const forgotPasswordMailGenContent = (username, resetUrl) => ({
  body: {
    name: username,
    intro: "We received a request to reset your password.",
    action: {
      instructions: "Click the button below to reset your password:",
      button: {
        color: "#E74C3C",
        text: "Reset Password",
        link: resetUrl,
      },
    },
    outro:
      "If you didn’t request a password reset, please ignore this email. Your password will remain unchanged.",
  },
});
