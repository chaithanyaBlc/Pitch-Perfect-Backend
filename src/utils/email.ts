import nodemailer from 'nodemailer';

type EmailPurpose = 'setup' | 'email-change';
type RoleType = 'superAdmin' | 'admin' | 'manager';

export const sendSetupEmail = async (
    email: string,
    token: string,
    purpose: string,
    role?: RoleType
    ): Promise<void> => {
    // Configure your email transport
    const transporter = nodemailer.createTransport({
        // Add your email service configuration here
        // Example for Gmail:
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let setupUrl: string;
    let subject: string;
    let bodyText: string;

    // if(purpose === 'superAdmin') {
    //     var setupUrl = `http://localhost:3000/superadmin/initialize/${token}`;
    // } else {
    //     var setupUrl = `http://localhost:3000/admin/initialize/${token}`;
    // } 
        
    switch (purpose) {
        case 'setup':
            if (!role) {
                throw new Error('Role is required for setup purpose');
            }
            setupUrl = `http://localhost:3000/${role.toLowerCase()}/initialize/${token}`;
            subject = 'Complete Your Account Setup';
            bodyText = `Click the link below to set up your password and complete your ${role} account creation:`;
            break;

        case 'email-change':
            setupUrl = `http://localhost:3000/verify-email?token=${token}`;
            subject = 'Confirm Email Address Change';
            bodyText = 'Click the link below to confirm your new email address:';
            break;

        default:
            throw new Error('Invalid email purpose');
    }

    const htmlContent = `
        <h1>${subject}</h1>
        <p>${bodyText}</p>
        <a href="${setupUrl}">${setupUrl}</a>
        <p>This link will expire after 24 hours or once used.</p>
    `;

    // const setupUrl = `http://localhost:3000/initialize/${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: htmlContent
    });
};