const getOTPTemplate = (title, name, otp, message, websiteUrl) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            body {
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #f8fafc;
                margin: 0;
                padding: 0;
                width: 100% !important;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }

            .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #f8fafc;
                padding: 40px 0;
            }

            .container {
                max-width: 600px;
                background-color: #ffffff;
                margin: 0 auto;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
            }

            .header {
                background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
                padding: 40px;
                text-align: center;
            }

            .logo-text {
                color: #ffffff;
                font-size: 28px;
                font-weight: 800;
                letter-spacing: -0.5px;
                margin: 0;
            }

            .content {
                padding: 48px 40px;
                text-align: center;
            }

            .title {
                color: #0f172a;
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 12px;
                letter-spacing: -0.5px;
            }

            .greeting {
                color: #64748b;
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 24px;
            }

            .message-box {
                background-color: #f1f5f9;
                padding: 24px;
                border-radius: 16px;
                margin-bottom: 32px;
            }

            .message-text {
                color: #334155;
                font-size: 15px;
                line-height: 1.6;
                margin: 0;
            }

            .otp-container {
                margin: 40px 0;
            }

            .otp-label {
                color: #94a3b8;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 12px;
            }

            .otp-code {
                color: #6366f1;
                font-size: 48px;
                font-weight: 800;
                letter-spacing: 12px;
                margin: 0;
                padding-left: 12px;
            }

            .footer {
                padding: 0 40px 48px 40px;
                text-align: center;
            }

            .security-notice {
                color: #94a3b8;
                font-size: 13px;
                line-height: 1.5;
                margin-bottom: 24px;
            }

            .button {
                display: inline-block;
                background-color: #0f172a;
                color: #ffffff !important;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 700;
                transition: transform 0.2s ease;
            }

            .social-footer {
                border-top: 1px solid #f1f5f9;
                padding: 32px 40px;
                text-align: center;
                background-color: #f8fafc;
            }

            .copyright {
                color: #cbd5e1;
                font-size: 12px;
                margin: 0;
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <h1 class="logo-text">NexusMart</h1>
                </div>
                
                <div class="content">
                    <h2 class="title">${title}</h2>
                    <p class="greeting">Hello ${name},</p>
                    
                    <div class="message-box">
                        <p class="message-text">${message}</p>
                    </div>

                    <div class="otp-container">
                        <p class="otp-label">Direct Verification Code</p>
                        <p class="otp-code">${otp}</p>
                    </div>

                    <p class="security-notice">
                        This code will expire in 10 minutes. For security, never share this code with anyone. 
                        If you didn't request this, please ignore this email.
                    </p>

                    <a href="${websiteUrl}" class="button">Go to Dashboard</a>
                </div>

                <div class="social-footer">
                    <p class="copyright">
                        &copy; 2025 NexusMart Premium. All rights reserved.<br>
                        Curated Luxury & Technology
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getOTPTemplate };
