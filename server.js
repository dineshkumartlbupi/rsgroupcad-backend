require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads (in memory)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Create SMTP transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false // For self-signed certificates
        }
    });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Debug endpoint to check if env vars are loaded (Safe version)
app.get('/api/config-check', (req, res) => {
    res.json({
        smtp_host: process.env.SMTP_HOST ? 'SET' : 'MISSING',
        smtp_user: process.env.SMTP_USER ? 'SET' : 'MISSING',
        smtp_pass: process.env.SMTP_PASS ? 'SET' : 'MISSING',
        recipient: process.env.RECIPIENT_EMAIL ? 'SET' : 'MISSING'
    });
});

// Career application endpoint
app.post('/api/career/apply', upload.single('resume'), async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            currentLocation,
            experience,
            currentCompany,
            noticePeriod,
            expectedSalary,
            linkedinProfile,
            portfolioLink,
            coverLetter,
            position,
            department
        } = req.body;

        const resume = req.file;

        // Create email HTML
        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #001528, #0033A0);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
        }
        .section {
            margin-bottom: 30px;
            border-left: 4px solid #0033A0;
            padding-left: 20px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #0033A0;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
        .info-row {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .label {
            font-weight: 600;
            color: #555;
            display: inline-block;
            width: 180px;
        }
        .value {
            color: #333;
        }
        .cover-letter {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            white-space: pre-wrap;
            font-style: italic;
            border-left: 4px solid #0033A0;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #666;
            border-radius: 0 0 10px 10px;
        }
        .badge {
            display: inline-block;
            background: #0033A0;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 New Career Application</h1>
        <p>RS Solar CAD Group - Career Portal</p>
        <div class="badge">${position}</div>
    </div>
    
    <div class="content">
        <div class="section">
            <div class="section-title">📋 Position Details</div>
            <div class="info-row">
                <span class="label">Position:</span>
                <span class="value"><strong>${position}</strong></span>
            </div>
            <div class="info-row">
                <span class="label">Department:</span>
                <span class="value">${department}</span>
            </div>
            <div class="info-row">
                <span class="label">Application Date:</span>
                <span class="value">${new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">👤 Personal Information</div>
            <div class="info-row">
                <span class="label">Full Name:</span>
                <span class="value">${fullName}</span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${email}">${email}</a></span>
            </div>
            <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value"><a href="tel:${phone}">${phone}</a></span>
            </div>
            <div class="info-row">
                <span class="label">Current Location:</span>
                <span class="value">${currentLocation}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">💼 Professional Information</div>
            <div class="info-row">
                <span class="label">Total Experience:</span>
                <span class="value">${experience}</span>
            </div>
            <div class="info-row">
                <span class="label">Current Company:</span>
                <span class="value">${currentCompany || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="label">Notice Period:</span>
                <span class="value">${noticePeriod || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="label">Expected Salary:</span>
                <span class="value">${expectedSalary || 'N/A'}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🔗 Additional Information</div>
            <div class="info-row">
                <span class="label">LinkedIn Profile:</span>
                <span class="value">${linkedinProfile ? `<a href="${linkedinProfile}" target="_blank">View Profile</a>` : 'Not provided'}</span>
            </div>
            <div class="info-row">
                <span class="label">Portfolio Link:</span>
                <span class="value">${portfolioLink ? `<a href="${portfolioLink}" target="_blank">View Portfolio</a>` : 'Not provided'}</span>
            </div>
            <div class="info-row">
                <span class="label">Resume:</span>
                <span class="value">${resume ? `📎 ${resume.originalname} (${(resume.size / 1024).toFixed(2)} KB)` : 'Not attached'}</span>
            </div>
        </div>

        ${coverLetter ? `
        <div class="section">
            <div class="section-title">✍️ Cover Letter</div>
            <div class="cover-letter">${coverLetter}</div>
        </div>
        ` : ''}
    </div>

    <div class="footer">
        <p><strong>This application was submitted through the RS Solar CAD Group Career Portal</strong></p>
        <p>Please contact the candidate at <a href="mailto:${email}">${email}</a> or <a href="tel:${phone}">${phone}</a></p>
        <p style="margin-top: 15px; font-size: 11px; color: #999;">
            © ${new Date().getFullYear()} RS Solar CAD Group. All rights reserved.
        </p>
    </div>
</body>
</html>
        `;

        // Create transporter
        const transporter = createTransporter();

        // Email options
        const mailOptions = {
            from: `"RS Solar CAD Career Portal" <${process.env.SMTP_USER}>`,
            to: process.env.RECIPIENT_EMAIL || 'Hr@rscadgroup.com',
            replyTo: email,
            subject: `New Job Application - ${position} - ${fullName}`,
            html: emailHTML,
            attachments: resume ? [{
                filename: resume.originalname,
                content: resume.buffer
            }] : []
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error sending email:', error);

        // Check if it's an authentication error
        if (error.code === 'EAUTH') {
            return res.status(500).json({
                success: false,
                message: 'SMTP authentication failed. Please configure your email credentials in the backend .env file.',
                error: 'SMTP_NOT_CONFIGURED',
                details: 'The email server rejected the login credentials. Please check SMTP_USER and SMTP_PASS in backend/.env file.',
                helpUrl: 'See CUSTOM_SMTP_SETUP.md for configuration instructions'
            });
        }

        // Other errors
        res.status(500).json({
            success: false,
            message: 'Failed to send application',
            error: error.message
        });
    }
});

// Contact Us endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            company,
            service,
            message
        } = req.body;

        // Create email HTML
        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #001528, #0033A0);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
        }
        .section {
            margin-bottom: 25px;
            border-left: 4px solid #0033A0;
            padding-left: 20px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #0033A0;
            margin-bottom: 12px;
            text-transform: uppercase;
        }
        .info-row {
            margin: 8px 0;
            padding: 6px 0;
        }
        .label {
            font-weight: 600;
            color: #555;
            display: inline-block;
            width: 140px;
        }
        .value {
            color: #333;
        }
        .message-box {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            white-space: pre-wrap;
            border-left: 4px solid #0033A0;
            margin-top: 15px;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #666;
            border-radius: 0 0 10px 10px;
        }
        .badge {
            display: inline-block;
            background: #0033A0;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📬 New Contact Form Submission</h1>
        <p>RS Solar CAD Group - Contact Us</p>
        <div class="badge">${service || 'General Inquiry'}</div>
    </div>
    
    <div class="content">
        <div class="section">
            <div class="section-title">📋 Contact Details</div>
            <div class="info-row">
                <span class="label">Full Name:</span>
                <span class="value"><strong>${fullName}</strong></span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${email}">${email}</a></span>
            </div>
            <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value"><a href="tel:${phone}">${phone}</a></span>
            </div>
            <div class="info-row">
                <span class="label">Company:</span>
                <span class="value">${company || 'Not provided'}</span>
            </div>
            <div class="info-row">
                <span class="label">Service Interested:</span>
                <span class="value">${service || 'Not specified'}</span>
            </div>
            <div class="info-row">
                <span class="label">Submitted:</span>
                <span class="value">${new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">💬 Message</div>
            <div class="message-box">${message || 'No message provided'}</div>
        </div>
    </div>

    <div class="footer">
        <p><strong>This inquiry was submitted through the RS Solar CAD Group Contact Us page</strong></p>
        <p>Please respond to <a href="mailto:${email}">${email}</a> or call <a href="tel:${phone}">${phone}</a></p>
        <p style="margin-top: 15px; font-size: 11px; color: #999;">
            © ${new Date().getFullYear()} RS Solar CAD Group. All rights reserved.
        </p>
    </div>
</body>
</html>
        `;

        // Create transporter
        const transporter = createTransporter();

        // Email options
        const mailOptions = {
            from: `"RS Solar CAD Contact Form" <${process.env.SMTP_USER}>`,
            to: process.env.RECIPIENT_EMAIL || 'Contact@rscadgroup.com',
            replyTo: email,
            subject: `New Contact Form Submission - ${service || 'General Inquiry'} - ${fullName}`,
            html: emailHTML
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Contact form email sent successfully:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Contact form submitted successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error sending contact form email:', error);

        if (error.code === 'EAUTH') {
            return res.status(500).json({
                success: false,
                message: 'SMTP authentication failed. Please configure your email credentials.',
                error: 'SMTP_NOT_CONFIGURED'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to send contact form',
            error: error.message
        });
    }
});

// Solar Installation inquiry endpoint
app.post('/api/solar-installation', async (req, res) => {
    try {
        const {
            fullName,
            whatsappNumber,
            monthlyBill,
            pincode,
            city,
            email,
            agreeToTerms
        } = req.body;

        // Create email HTML
        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #001528, #0033A0);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
        }
        .section {
            margin-bottom: 25px;
            border-left: 4px solid #0033A0;
            padding-left: 20px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #0033A0;
            margin-bottom: 12px;
            text-transform: uppercase;
        }
        .info-row {
            margin: 8px 0;
            padding: 6px 0;
        }
        .label {
            font-weight: 600;
            color: #555;
            display: inline-block;
            width: 160px;
        }
        .value {
            color: #333;
        }
        .highlight {
            background: #fff3cd;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
            margin: 15px 0;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #666;
            border-radius: 0 0 10px 10px;
        }
        .badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>☀️ New Solar Installation Inquiry</h1>
        <p>Indian Solar Installation Service</p>
        <div class="badge">New Lead</div>
    </div>
    
    <div class="content">
        <div class="section">
            <div class="section-title">👤 Customer Information</div>
            <div class="info-row">
                <span class="label">Full Name:</span>
                <span class="value"><strong>${fullName}</strong></span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${email}">${email}</a></span>
            </div>
            <div class="info-row">
                <span class="label">WhatsApp Number:</span>
                <span class="value"><a href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}">${whatsappNumber}</a></span>
            </div>
            <div class="info-row">
                <span class="label">City:</span>
                <span class="value">${city}</span>
            </div>
            <div class="info-row">
                <span class="label">Pincode:</span>
                <span class="value">${pincode}</span>
            </div>
        </div>

        <div class="highlight">
            <div class="section-title" style="margin-bottom: 8px;">💡 Energy Consumption</div>
            <div class="info-row">
                <span class="label">Monthly Electricity Bill:</span>
                <span class="value"><strong style="font-size: 18px; color: #0033A0;">₹${monthlyBill}</strong></span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📅 Inquiry Details</div>
            <div class="info-row">
                <span class="label">Submitted:</span>
                <span class="value">${new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</span>
            </div>
            <div class="info-row">
                <span class="label">Terms Accepted:</span>
                <span class="value">${agreeToTerms ? '✅ Yes' : '❌ No'}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🎯 Next Steps</div>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Contact customer via WhatsApp: <a href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}">${whatsappNumber}</a></li>
                <li>Send email to: <a href="mailto:${email}">${email}</a></li>
                <li>Assess solar potential based on monthly bill: ₹${monthlyBill}</li>
                <li>Schedule site survey in ${city}, ${pincode}</li>
                <li>Prepare customized solar solution proposal</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p><strong>This inquiry was submitted through the Indian Solar Installation page</strong></p>
        <p>Contact customer: <a href="https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}">WhatsApp</a> | <a href="mailto:${email}">Email</a></p>
        <p style="margin-top: 15px; font-size: 11px; color: #999;">
            © ${new Date().getFullYear()} RS Solar CAD Group. All rights reserved.
        </p>
    </div>
</body>
</html>
        `;

        // Create transporter
        const transporter = createTransporter();

        // Email options
        const mailOptions = {
            from: `"RS Solar Installation Inquiry" <${process.env.SMTP_USER}>`,
            to: process.env.RECIPIENT_EMAIL || 'Contact@rscadgroup.com',
            replyTo: email,
            subject: `New Solar Installation Inquiry - ${city} - ₹${monthlyBill}/month - ${fullName}`,
            html: emailHTML
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Solar installation inquiry email sent successfully:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Solar installation inquiry submitted successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error sending solar installation inquiry email:', error);

        if (error.code === 'EAUTH') {
            return res.status(500).json({
                success: false,
                message: 'SMTP authentication failed. Please configure your email credentials.',
                error: 'SMTP_NOT_CONFIGURED'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to send solar installation inquiry',
            error: error.message
        });
    }
});

// Free Consultation endpoint (Footer Form)
app.post('/api/consultation', async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            city,
            source = 'Footer Form'
        } = req.body;

        // Create email HTML
        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }
        .header {
            background: linear-gradient(135deg, #1f3366, #e62e00);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e0e0e0;
        }
        .section {
            margin-bottom: 25px;
            border-left: 4px solid #1f3366;
            padding-left: 20px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f3366;
            margin-bottom: 12px;
            text-transform: uppercase;
        }
        .info-row {
            margin: 8px 0;
            padding: 6px 0;
        }
        .label {
            font-weight: 600;
            color: #555;
            display: inline-block;
            width: 140px;
        }
        .value {
            color: #333;
        }
        .footer {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #666;
            border-radius: 0 0 10px 10px;
        }
        .badge {
            display: inline-block;
            background: #e62e00;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 New Free Consultation Request</h1>
        <p>RS Solar CAD Group - ${source}</p>
        <div class="badge">Immediate Action Required</div>
    </div>
    
    <div class="content">
        <div class="section">
            <div class="section-title">👤 Potential Client Details</div>
            <div class="info-row">
                <span class="label">Name:</span>
                <span class="value"><strong>${name}</strong></span>
            </div>
            <div class="info-row">
                <span class="label">Phone:</span>
                <span class="value"><a href="tel:${phone}">${phone}</a></span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${email}">${email}</a></span>
            </div>
            <div class="info-row">
                <span class="label">City:</span>
                <span class="value">${city}</span>
            </div>
            <div class="info-row">
                <span class="label">Submitted:</span>
                <span class="value">${new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</span>
            </div>
            <div class="info-row">
                <span class="label">Source:</span>
                <span class="value">${source}</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🎯 Next Steps</div>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Call the client at: <a href="tel:${phone}">${phone}</a></li>
                <li>Email the client at: <a href="mailto:${email}">${email}</a></li>
                <li>Prepare for a consultation regarding their CAD/Solar needs in ${city}.</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p><strong>This request was submitted through: ${source}</strong></p>
        <p style="margin-top: 15px; font-size: 11px; color: #999;">
            © ${new Date().getFullYear()} RS Solar CAD Group. All rights reserved.
        </p>
    </div>
</body>
</html>
        `;

        // Create transporter
        const transporter = createTransporter();

        // Email options
        const mailOptions = {
            from: `"RS Solar CAD Consultation" <${process.env.SMTP_USER}>`,
            to: process.env.RECIPIENT_EMAIL || 'Contact@rscadgroup.com',
            replyTo: email,
            subject: `New Consultation Request - ${city} - ${name}`,
            html: emailHTML
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Consultation email sent successfully:', info.messageId);

        res.status(200).json({
            success: true,
            message: 'Consultation request submitted successfully',
            messageId: info.messageId
        });

    } catch (error) {
        console.error('Error sending consultation email:', error);

        if (error.code === 'EAUTH') {
            return res.status(500).json({
                success: false,
                message: 'SMTP authentication failed. Please configure your email credentials.',
                error: 'SMTP_NOT_CONFIGURED'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to send consultation request',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📧 SMTP configured for: ${process.env.SMTP_USER}`);
});
