// Simple SMTP Test Script
// Run with: node test-smtp.js

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Testing SMTP Configuration...\n');

console.log('Configuration:');
console.log('- SMTP_HOST:', process.env.SMTP_HOST);
console.log('- SMTP_PORT:', process.env.SMTP_PORT);
console.log('- SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('- SMTP_USER:', process.env.SMTP_USER);
console.log('- SMTP_PASS:', process.env.SMTP_PASS ? `${process.env.SMTP_PASS.substring(0, 4)}****` : 'NOT SET');
console.log('- SMTP_PASS Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);
console.log('- SMTP_PASS (full):', process.env.SMTP_PASS); // Show full password for debugging
console.log('');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

console.log('📧 Attempting to send test email...\n');

const mailOptions = {
    from: `"Test" <${process.env.SMTP_USER}>`,
    to: process.env.RECIPIENT_EMAIL || 'Hr@rscadgroup.com',
    subject: 'SMTP Test Email',
    text: 'This is a test email to verify SMTP configuration.',
    html: '<h1>SMTP Test</h1><p>This is a test email to verify SMTP configuration.</p>'
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log('❌ Error sending email:');
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        console.log('Response:', error.response);
        console.log('\n📋 Troubleshooting:');
        console.log('1. Check if app password is correct (no spaces)');
        console.log('2. Verify 2FA is enabled on the Google account');
        console.log('3. Make sure app password is for the correct email account');
        console.log('4. Check if Google Workspace admin has enabled app passwords');
        process.exit(1);
    } else {
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('\n🎉 SMTP is configured correctly!');
        process.exit(0);
    }
});
