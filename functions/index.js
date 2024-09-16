const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password,
  },
});

exports.sendEmailNotification = functions.https.onCall(async (data, context) => {
  const { userId, testTakerName } = data;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.error('User document not found');
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    const userData = userDoc.data();
    const userEmail = userData.email;
    const userFirstName = userData.name.split(' ')[0];

    console.log(`Sending email to: ${userEmail}`);

    const mailOptions = {
      from: functions.config().gmail.email,
      to: userEmail,
      subject: 'New MBTI Test Submission for You!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New MBTI Test Submission</title>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background-color: #4F46E5; padding: 30px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
            .content { padding: 30px 20px; }
            .content h2 { color: #4F46E5; margin-top: 0; }
            .highlight { background-color: #f0f0ff; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; background-color: #4F46E5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; text-shadow: none; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.8em; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New MBTI Test Submission</h1>
            </div>
            <div class="content">
              <h2>Hello ${userFirstName},</h2>
              <p>Great news! Someone has just submitted an MBTI test for you on <a href="https://www.truembti.com" style="color: #4F46E5; text-decoration: none;">TrueMBTI</a>.</p>
              <p>This new input will help refine your personality profile and provide you with more accurate insights.</p>
              <p>To see your updated results, click the button below:</p>
              <p style="text-align: center;">
                <a href="https://www.truembti.com/dashboard" class="button">View Your Updated Results</a>
              </p>
              <p>Thank you for using TrueMBTI to discover your true personality type!</p>
            </div>
            <div class="footer">
              <p>© 2023 TrueMBTI. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', `Failed to send email: ${error.message}`);
  }
});

exports.sendAdminNotification = functions.auth.user().onCreate(async (user) => {
  const mailOptions = {
    from: functions.config().gmail.email,
    to: 'ericchoi325@gmail.com',
    subject: 'New User Signup on TrueMBTI',
    html: `
      <h1>New User Signup</h1>
      <p>A new user has signed up for TrueMBTI:</p>
      <ul>
        <li>Email: ${user.email}</li>
        <li>User ID: ${user.uid}</li>
        <li>Signup Time: ${user.metadata.creationTime}</li>
      </ul>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error: error.message };
  }
});