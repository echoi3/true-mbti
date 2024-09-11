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
      subject: 'New MBTI Test Submission',
      html: `
        <h1>Hello ${userFirstName},</h1>
        <p>Your friends or family just submitted an MBTI test for you!</p>
        <p><a href="https://www.truembti.com/dashboard">Log in to your TrueMBTI dashboard</a> to see your updated results.</p>
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