const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

// A simple endpoint to check the server status
router.get('/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint to connect with the AI Studio app
router.post('/connect', (req, res) => {
  // We will add the logic to connect with the Google RCS API here
  res.json({ message: 'Connected to the server' });
});

// Endpoint to send a message
router.post('/send-message', async (req, res) => {
  const { msisdn, message } = req.body;

  // TODO: Replace with your service account credentials
  const credentials = require('../credentials.json');

  const rbmApi = google.rcsbusinessmessaging({
    version: 'v1',
    auth: new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/rcsbusinessmessaging'],
    }),
  });

  try {
    const response = await rbmApi.phones.sendMessage({
      parent: `phones/${msisdn}`,
      resource: {
        contentMessage: {
          text: message,
        },
      },
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to receive messages from the RCS platform
router.post('/webhook', (req, res) => {
  console.log('Received webhook:', req.body);
  res.sendStatus(200);
});

module.exports = router;