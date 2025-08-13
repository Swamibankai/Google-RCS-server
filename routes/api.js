const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const rbmApiHelper = require('@google/rcsbusinessmessaging');
const fs = require('fs');
const path = require('path');
const os = require('os');


// A simple endpoint to check the server status
router.get('/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint to get analytics menu data
router.get('/analytics/menu', (req, res) => {
  const analyticsDataPath = path.join(__dirname, '..', 'analytics-data.json');
  fs.readFile(analyticsDataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading analytics data file:', err);
      res.status(500).json({ error: 'Failed to read analytics data' });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// --- START: Added Mock Data Endpoints ---

const mockBrands = [
  { id: 'brand_alpha', name: 'Alpha Brand', companyWebsite: 'https://alpha.com', contactEmail: 'contact@alpha.com', status: 'Active' },
  { id: 'brand_beta', name: 'Beta Corp', companyWebsite: 'https://beta.com', contactEmail: 'info@beta.com', status: 'Active' },
];

const mockAgents = [
  { id: 'agent_one', name: 'Agent One', brandId: 'brand_alpha', status: 'Verified' },
  { id: 'agent_two', name: 'Agent Two', brandId: 'brand_beta', status: 'Verified' },
];

const mockDevices = [
  { id: 'device_one', phoneNumber: '+1234567890', model: 'Pixel 5', status: 'Active' },
  { id: 'device_two', phoneNumber: '+1987654321', model: 'iPhone 13', status: 'Active' },
];

const mockMessages = [
  { id: 'msg_001', agentId: 'agent_one', msisdn: '+1234567890', text: 'Hello from Agent One', status: 'DELIVERED' },
  { id: 'msg_002', agentId: 'agent_two', msisdn: '+1987654321', text: 'Hello from Agent Two', status: 'READ' },
];


router.get('/brands', (req, res) => {
  res.json(mockBrands);
});





module.exports = router;

router.get('/devices', (req, res) => {
  res.json(mockDevices);
});

router.get('/analytics/messages', (req, res) => {
  // For simplicity, returning all mock messages.
  // In a real app, this would involve filtering by agentId, date, status etc.
  res.json(mockMessages);
});

// Endpoint to get daily data from daily_data.json
router.get('/daily-data', (req, res) => {
  const dailyDataPath = path.join(__dirname, '..', 'daily_data.json');
  fs.readFile(dailyDataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading daily_data.json:', err);
      res.status(500).json({ error: 'Failed to read daily data' });
      return;
    }
    res.json(JSON.parse(data));
  });
});

// --- END: Added Mock Data Endpoints ---

// Helper function to read agents from file
const readAgentsFromFile = () => {
  const agentsFilePath = path.join(__dirname, '..', 'agents.json');
  try {
    if (fs.existsSync(agentsFilePath)) {
      const data = fs.readFileSync(agentsFilePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading agents.json:', error);
  }
  return [];
};

// Helper function to write agents to file
const writeAgentsToFile = (agents) => {
  const agentsFilePath = path.join(__dirname, '..', 'agents.json');
  try {
    fs.writeFileSync(agentsFilePath, JSON.stringify(agents, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing agents.json:', error);
  }
};

// API routes for Agents (using file-based persistence)
router.get('/agents', (req, res) => {
  res.json(readAgentsFromFile());
});

router.post('/agents', (req, res) => {
  const newAgent = req.body;
  const agents = readAgentsFromFile();
  agents.push(newAgent);
  writeAgentsToFile(agents);
  res.status(201).json(newAgent);
});

router.put('/agents/:id', (req, res) => {
  const agentId = req.params.id;
  const updatedAgent = req.body;
  let agents = readAgentsFromFile();
  agents = agents.map(agent => (agent.id === agentId ? updatedAgent : agent));
  writeAgentsToFile(agents);
  res.json(updatedAgent);
});

router.delete('/agents/:id', (req, res) => {
  const agentId = req.params.id;
  let agents = readAgentsFromFile();
  agents = agents.filter(agent => agent.id !== agentId);
  writeAgentsToFile(agents);
  res.status(204).send(); // No Content
});

// Endpoint to check RCS capability
router.post('/check-rcs-capability', async (req, res) => {
  const { msisdn, agentId } = req.body; // Add agentId to destructuring

  const credentials = require('../credentials.json');

  const homeDir = os.homedir();
  const certPath = path.join(homeDir, 'ZscalerRootCertificate.crt');
  const cert = fs.readFileSync(certPath);

  google.options({ ca: cert });

  rbmApiHelper.initRbmApi(credentials, rbmApiHelper.REGION_US);
  if (!agentId) {
    return res.status(400).json({ success: false, error: 'Agent ID is required for checking RCS capability.' });
  }
  rbmApiHelper.setAgentId(agentId); // Set agentId dynamically

  try {
    const response = await rbmApiHelper.checkCapability(msisdn);
    console.log('Full response from rbmApiHelper.checkCapability:', JSON.stringify(response, null, 2));
    // The response structure from checkCapability might vary,
    // typically it's an array of capabilities or a boolean.
    // Assuming it returns a structure that indicates RCS capability.
    // For simplicity, let's assume response.data.rcsCapable is the boolean.
    res.json({
      isRcsCapable: response.data.features && response.data.features.length > 0,
      features: response.data.features || []
    });
  } catch (error) {
    console.error('Error checking RCS capability:', error);
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to connect with the AI Studio app
router.post('/connect', (req, res) => {
  // We will add the logic to connect with the Google RCS API here
  res.json({ message: 'Connected to the server' });
});

// Endpoint to send a message
router.post('/send-message', async (req, res) => {
  const { msisdn, message, agentId } = req.body; // Added agentId to destructuring

  const credentials = require('../credentials.json');

  const homeDir = os.homedir();
  const certPath = path.join(homeDir, 'ZscalerRootCertificate.crt');
  const cert = fs.readFileSync(certPath);

  // Set the custom CA for all googleapis requests
  google.options({ ca: cert });

  // Initialize the RBM API helper
  rbmApiHelper.initRbmApi(credentials, rbmApiHelper.REGION_US);
  // Use dynamic agentId if provided, otherwise fallback to a default or error
  if (!agentId) {
    return res.status(400).json({ success: false, error: 'Agent ID is required for sending messages.' });
  }
  rbmApiHelper.setAgentId(agentId); // Use dynamic agentId

  try {
    const response = await rbmApiHelper.sendMessage({
      msisdn: msisdn,
      messageText: message,
    });
    recordTestResult(msisdn, message, true, null); // Record success
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error during RBM API call:', error);
    recordTestResult(msisdn, message, false, error.message); // Record failure
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to record test results
const recordTestResult = (msisdn, message, success, errorMessage) => {
  const testResultsPath = path.join(__dirname, '..', 'daily_test_results.json');
  try {
    let results = [];
    if (fs.existsSync(testResultsPath)) {
      const data = fs.readFileSync(testResultsPath, 'utf8');
      results = JSON.parse(data);
    }

    const newResult = {
      timestamp: new Date().toISOString(),
      msisdn: msisdn,
      message: message,
      success: success,
      errorMessage: errorMessage
    };

    results.push(newResult);
    fs.writeFileSync(testResultsPath, JSON.stringify(results, null, 2), 'utf8');
  } catch (error) {
    console.error('Error recording test result:', error);
  }
};

// Endpoint to get daily test results
router.get('/daily-test-results', (req, res) => {
  const testResultsPath = path.join(__dirname, '..', 'daily_test_results.json');
  try {
    if (fs.existsSync(testResultsPath)) {
      const data = fs.readFileSync(testResultsPath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json([]); // Return empty array if file doesn't exist
    }
  } catch (error) {
    console.error('Error reading daily_test_results.json:', error);
    res.status(500).json({ error: 'Failed to read daily test results' });
  }
});

// Endpoint to receive messages from the RCS platform
router.post('/webhook', async (req, res) => {
  const payload = req.body;
  console.log('Received RBM webhook payload:', JSON.stringify(payload, null, 2));

  if (payload.messageDeliveryReport) {
    const report = payload.messageDeliveryReport;
    console.log(`Message Delivery Report for MSISDN: ${report.msisdn}`);
    console.log(`Message ID: ${report.messageId}`);
    console.log(`Delivery Status: ${report.deliveryStatus}`);
    if (report.deliveryStatus === 'FAILED') {
      console.log(`Failure Reason: ${report.failureReason}`);
    }
  } else if (payload.deviceCapabilityUpdate) {
    const update = payload.deviceCapabilityUpdate;
    console.log(`Device Capability Update for MSISDN: ${update.msisdn}`);
    console.log(`Capabilities: ${update.capabilities.join(', ')}`);
  } else if (payload.message) {
    const incomingMessage = payload.message;
    console.log(`Incoming Message from MSISDN: ${incomingMessage.msisdn}`);
    console.log(`Message Text: ${incomingMessage.text}`);

    // --- Start of new echo logic ---
    const credentials = require('../credentials.json');
    const homeDir = os.homedir();
    const certPath = path.join(homeDir, 'ZscalerRootCertificate.crt');
    const cert = fs.readFileSync(certPath);
    google.options({ ca: cert });

    rbmApiHelper.initRbmApi(credentials, rbmApiHelper.REGION_US);
    rbmApiHelper.setAgentId('panamax_e5qiw4pk_agent'); // <--- REPLACE WITH YOUR ACTUAL RBM AGENT ID

    try {
      // Send a reply echoing the user's message
      await rbmApiHelper.sendMessage({
        msisdn: incomingMessage.msisdn,
        messageText: `You said: "${incomingMessage.text}"`,
      });
      console.log(`Successfully sent echo reply to ${incomingMessage.msisdn}`);
    } catch (error) {
      console.error('Error sending echo reply:', error);
    }
    // --- End of new echo logic ---

  } else {
    console.log('Unknown RBM webhook type received.');
  }

  res.sendStatus(200);
});

module.exports = router;