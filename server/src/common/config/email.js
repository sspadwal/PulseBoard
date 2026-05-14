import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"Mailtrap Test" <bkbirla1002@gmail.com>',
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

export { sendEmail };









// import nodemailer from "nodemailer"

// const transporter = nodemailer.createTransport({
//     host: "smtp.example.com",
//     port: 587,
//     secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//     },
// });


// const sendEmail = async (to, subject, html) => {
//     try {
//         await transporter.sendMail({
//             from,
//             to,
//             subject,
//             text: "Hello world?", // plain text body
//             html: html
//         });
//     } catch (err) {
//         console.error("Error while sending mail:", err);
//     }

// }

// const verificationEmail = async (email, token) => {
//     await transporter.sendMail({
//         from: `${process.env.SMTP_FROM_EMAIL}`,
//         email,
//         subject,
//         text: "Hello world?",
//         html: html
//     });

// }

// export { sendEmail, verificationEmail }