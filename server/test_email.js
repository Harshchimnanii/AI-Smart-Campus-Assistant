const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const sendTestEmail = async () => {
    console.log('Testing Email Configuration...');
    console.log(`User: ${process.env.EMAIL_USER}`);
    // Don't log the full password
    console.log(`Pass: ${process.env.EMAIL_PASS ? '********' : 'Not Set'}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'gunsolanki43@gmail.com',
        subject: 'Test OTP - AI Smart Campus',
        text: `This is a test OTP requested by you: ${otp}`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:');
        console.error(error);
    }
};

sendTestEmail();
