import nodemailer from 'nodemailer';

// Generate SMTP service account from ethereal.email
// In production, use your own SMTP credentials like SendGrid or Gmail
const createTransporter = async () => {
    let host = process.env.SMTP_HOST;
    let port = process.env.SMTP_PORT;
    let user = process.env.SMTP_USER;
    let pass = process.env.SMTP_PASS;

    if (!host) {
        let testAccount = await nodemailer.createTestAccount();
        host = 'smtp.ethereal.email';
        port = 587;
        user = testAccount.user;
        pass = testAccount.pass;
    }

    let transporter = nodemailer.createTransport({
        host: host,
        port: port || 587,
        secure: port == 465, // true for 465, false for other ports
        auth: {
            user: user,
            pass: pass
        }
    });

    return transporter;
};

export const sendServiceRequestEmail = async (providerEmails, requestData) => {
    try {
        const transporter = await createTransporter();

        const acceptUrl = `http://localhost:5173/accept-request/${requestData._id}`;

        const mailOptions = {
            from: '"MultiDomain Platform" <noreply@multidomainplatform.com>',
            to: providerEmails.join(','), // Send to all matching providers
            subject: 'New Service Request Available',
            html: `
                <h2>A new ${requestData.serviceType} request is available.</h2>
                <p><strong>Location:</strong> ${requestData.location}</p>
                <p><strong>Date:</strong> ${requestData.date}</p>
                <p><strong>Description:</strong> ${requestData.description}</p>
                <br/>
                <p>Click below to securely review and accept this request:</p>
                <a href="${acceptUrl}" style="padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">Accept Service</a>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Request emails sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Failed to send service request emails:', error);
    }
};

export const sendConfirmationEmail = async (customerEmail, provider, requestData) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: '"MultiDomain Platform" <noreply@multidomainplatform.com>',
            to: customerEmail,
            subject: 'Your Service Request Has Been Accepted',
            html: `
                <h2>Great news! Your ${requestData.serviceType} request has been accepted.</h2>
                <p><strong>Service Provider:</strong> ${provider.name}</p>
                <p><strong>Contact:</strong> ${provider.phone || provider.email}</p>
                <p><strong>Scheduled Date:</strong> ${requestData.date}</p>
                <br/>
                <p>Thank you for using the MultiDomain Platform.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Confirmation email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Failed to send confirmation email:', error);
    }
};

export const sendDirectBookingEmail = async (providerEmail, customer, bookingData) => {
    try {
        const transporter = await createTransporter();

        const mailOptions = {
            from: '"MultiDomain Platform" <noreply@multidomainplatform.com>',
            to: providerEmail,
            subject: 'New Direct Booking Received',
            html: `
                <h2>Great news! You have received a new direct booking for ${bookingData.service}.</h2>
                <p><strong>Customer:</strong> ${customer.name}</p>
                <p><strong>Contact:</strong> ${customer.phone || customer.email}</p>
                <p><strong>Date:</strong> ${bookingData.date} at ${bookingData.time}</p>
                <p><strong>Price:</strong> $${bookingData.price}</p>
                <br/>
                <p>Please log in to your Provider Dashboard to manage this booking.</p>
                <a href="http://localhost:5173/login" style="padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">View Bookings</a>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Direct booking email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Failed to send direct booking email:', error);
    }
};

export const sendFeedbackEmail = async (customerEmail, provider, bookingData) => {
    try {
        const transporter = await createTransporter();

        const feedbackUrl = `http://localhost:5173/feedback/${bookingData._id}`;

        const mailOptions = {
            from: '"MultiDomain Platform" <noreply@multidomainplatform.com>',
            to: customerEmail,
            subject: 'Your Service Has Been Completed – Please Rate Your Experience',
            html: `
                <h2>Your ${bookingData.service} service has been completed by ${provider.name}.</h2>
                <p>We value your feedback. How was your experience?</p>
                <div style="font-size: 24px; color: #FFD700; margin-bottom: 20px;">
                    ⭐ ⭐ ⭐ ⭐ ⭐
                </div>
                <p>Click below to submit feedback and optionally upload photos of completed work:</p>
                <a href="${feedbackUrl}" style="padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">Submit Feedback</a>
                <br/><br/>
                <p>Thank you for using the MultiDomain Platform!</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Feedback email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Failed to send feedback email:', error);
    }
};
