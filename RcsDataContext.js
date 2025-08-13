
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api'; 

export const RcsDataContext = createContext();

export const RcsDataProvider = ({ children }) => {
  const [partnerInfo, setPartnerInfo] = useState({
    id: 'partner_main_001',
    email: 'Tester_one@testplatformil.com',
    partnerIdDisplay: 'testplatform---a-testplatform-group-ccpcxtt2',
    partnerName: 'Testing - A Testplatform Group',
    displayName: 'Testing - A Testplatform Group',
    technicalContact: {
        name: 'Tester_one',
        email: 'tech-contact@example.com',
        phone: '+15550001111',
    },
  });
  const [googleRCSConfig, setGoogleRCSConfig] = useState({
    apiKey: 'RBM_API_KEY_SAMPLE_VALUE_12345XYZ',
    webhookUrl: 'https://partner.example.com/rcs/global-webhook-endpoint',
    ipAddress: '198.51.100.12',
    host: 'rbm.partner.api.example.com',
    port: '9443',
    endpointIp: '203.0.113.50',
  });
  const [partnerUsers, setPartnerUsers] = useState([
    { id: 'user1', email: 'admin_one@testplatformil.com', role: 'Manager' },
    { id: 'user2', email: 'Tester_one@testplatformil.com', role: 'Owner' },
  ]);
  const [serviceAccountKeys, setServiceAccountKeys] = useState([
    { id: 'key1', keyValue: '254594d1e969dda8e904645d5fd3ed08766aecfc', creationDate: 'Jan 16, 2025, 3:18:26 PM', status: 'Active' },
    { id: 'key2', keyValue: '55685fa00dce5aeae265b5d5880d78d44f4bdb39', creationDate: 'Jan 29, 2025, 10:39:31 AM', status: 'Active' },
  ]);

  // Data that will be fetched from the backend
  const [brands, setBrands] = useState([]);
  const [agents, setAgents] = useState([]);
  const [devices, setDevices] = useState([]);
  const [analyticsMenu, setAnalyticsMenu] = useState([]);
  const [messages, setMessages] = useState([]);

  const [currentAgentId, setCurrentAgentId] = useState(null);
  const [googleClientId, setGoogleClientId] = useState('');
  const [rbmPartnerId, setRbmPartnerId] = useState('');

  // Mock authentication state
  const [accessToken, setAccessToken] = useState(null);
  const [profile, setProfile] = useState(null);

  const sampleAnalyticsData = [
    { metric: 'Messages Sent', value: 10500, period: 'Last 30 Days' },
    { metric: 'Messages Delivered', value: 10250, period: 'Last 30 Days' },
    { metric: 'Delivery Rate', value: '97.6%', period: 'Last 30 Days' },
    { metric: 'Messages Read', value: 8500, period: 'Last 30 Days' },
    { metric: 'Read Rate', value: '82.9%', period: 'Last 30 Days' },
    { metric: 'User Opt-ins', value: 120, period: 'Last 30 Days' },
    { metric: 'User Opt-outs', value: 15, period: 'Last 30 Days' },
    { metric: 'Average Response Time', value: '1.2s', period: 'Last 30 Days' },
  ];

  const sampleAgentHistory = [
    { id: 'hist1', date: '2023-10-01', event: 'Agent Created', details: 'Agent "Testproduct" created under brand "DPCheckA".', user: 'admin@partner.com' },
    { id: 'hist2', date: '2023-10-02', event: 'Submitted for Verification', details: 'Agent "Testproduct" submitted for RBM verification.', user: 'admin@partner.com' },
    { id: 'hist3', date: '2023-10-05', event: 'Verification Approved', details: 'RBM verification approved.', user: 'RBM Platform' },
    { id: 'hist4', date: '2023-10-06', event: 'Launch Scheduled', details: 'Scheduled launch for 2023-10-10.', user: 'admin@partner.com' },
    { id: 'hist5', date: '2023-10-10', event: 'Agent Launched', details: 'Agent "Testproduct" is now live.', user: 'RBM Platform' },
    { id: 'hist6', date: '2023-11-01', event: 'Configuration Update', details: 'Webhook Message URL updated.', user: 'dev@partner.com' },
  ];

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands`);
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    console.log("Attempting to fetch agents..."); // Added log
    try {
      const response = await fetch(`${API_BASE_URL}/agents`);
      console.log("Response from /api/agents:", response); // Added log
      const data = await response.json();
      setAgents(data);
      console.log("Agents fetched and set:", data); // Added log
      if (data.length > 0 && !currentAgentId) {
        setCurrentAgentId(data[0].id); // Set first agent as current by default if none selected
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  }, [currentAgentId]);

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/devices`);
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  }, []);

  const fetchAnalyticsMenu = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/menu`);
      const data = await response.json();
      setAnalyticsMenu(data.analyticsMenu);
      console.log("Fetched analytics menu:", data.analyticsMenu);
    } catch (error) {
      console.error("Error fetching analytics menu:", error);
    }
  }, []);

  const fetchMessages = useCallback(async (agentId, startDate, endDate, status) => {
    try {
      let url = `${API_BASE_URL}/analytics/messages`;
      const params = new URLSearchParams();
      if (agentId) params.append('agentId', agentId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchBrands();
    fetchAgents();
    // fetchDevices(); // Removed from here, as Devices component will fetch based on selectedAgentId
    fetchAnalyticsMenu();
    fetchMessages();
  }, [fetchBrands, fetchAgents, fetchAnalyticsMenu, fetchMessages]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const currentAgent = agents.find(agent => agent.id === currentAgentId);

  // --- Data Manipulation Functions (interacting with backend) ---
  const updatePartnerInfo = useCallback((updatedInfo) => {
    setPartnerInfo(updatedInfo);
    // TODO: Implement backend call for partnerInfo if needed
  }, []);

  const addPartnerUser = useCallback((newUser) => {
    setPartnerUsers(prev => [...prev, newUser]);
    // TODO: Implement backend call for partnerUsers if needed
  }, []);

  const updatePartnerUser = useCallback((updatedUser) => {
    setPartnerUsers(prev => prev.map(user => user.id === updatedUser.id ? updatedUser : user));
    // TODO: Implement backend call for partnerUsers if needed
  }, []);

  const removePartnerUser = useCallback((userId) => {
    setPartnerUsers(prev => prev.filter(user => user.id !== userId));
    // TODO: Implement backend call for partnerUsers if needed
  }, []);

  const addServiceAccountKey = useCallback((newKey) => {
    setServiceAccountKeys(prev => [...prev, newKey]);
    // TODO: Implement backend call for serviceAccountKeys if needed
  }, []);

  const deleteServiceAccountKey = useCallback((keyId) => {
    setServiceAccountKeys(prev => prev.filter(key => key.id !== keyId));
    // TODO: Implement backend call for serviceAccountKeys if needed
  }, []);

  const updateGoogleRCSConfig = useCallback((updatedConfig) => {
    setGoogleRCSConfig(updatedConfig);
    // TODO: Implement backend call for googleRCSConfig if needed
  }, []);

  const clearAllData = useCallback(() => {
    // This will only clear frontend state, not backend data
    setPartnerInfo({
      id: 'partner_main_001',
      email: 'Tester_one@testplatformil.com',
      partnerIdDisplay: 'testplatform---a-testplatform-group-ccpcxtt2',
      partnerName: 'Testing - A Testplatform Group',
      displayName: 'Testing - A Testplatform Group',
      technicalContact: {
          name: 'Tester_one',
          email: 'tech-contact@example.com',
          phone: '+15550001111',
      },
    });
    setGoogleRCSConfig({
      apiKey: 'RBM_API_KEY_SAMPLE_VALUE_12345XYZ',
      webhookUrl: 'https://partner.example.com/rcs/global-webhook-endpoint',
      ipAddress: '198.51.100.12',
      host: 'rbm.partner.api.example.com',
      port: '9443',
      endpointIp: '203.0.113.50',
    });
    setPartnerUsers([
      { id: 'user1', email: 'admin_one@testplatformil.com', role: 'Manager' },
      { id: 'user2', email: 'Tester_one@testplatformil.com', role: 'Owner' },
    ]);
    setServiceAccountKeys([
      { id: 'key1', keyValue: '254594d1e969dda8e904645d5fd3ed08766aecfc', creationDate: 'Jan 16, 2025, 3:18:26 PM', status: 'Active' },
      { id: 'key2', keyValue: '55685fa00dce5aeae265b5d5880d78d44f4bdb39', creationDate: 'Jan 29, 2025, 10:39:31 AM', status: 'Active' },
    ]);
    setGoogleClientId('');
    setRbmPartnerId('');
    setAccessToken(null);
    setProfile(null);
    refreshData(); // Re-fetch data from backend after clearing local state
  }, [refreshData]);

  const addBrand = useCallback(async (id, name, companyWebsite, contactEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, companyWebsite, contactEmail, status: 'Active' }),
      });
      const newBrand = await response.json();
      setBrands(prev => [...prev, newBrand]);
    } catch (error) {
      console.error("Error adding brand:", error);
    }
  }, []);

  const updateBrand = useCallback(async (updatedBrand) => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands/${updatedBrand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBrand),
      });
      const data = await response.json();
      setBrands(prev => prev.map(brand => brand.id === data.id ? data : brand));
    } catch (error) {
      console.error("Error updating brand:", error);
    }
  }, []);

  const deleteBrand = useCallback(async (brandId) => {
    try {
      await fetch(`${API_BASE_URL}/brands/${brandId}`, {
        method: 'DELETE',
      });
      setBrands(prev => prev.filter(brand => brand.id !== brandId));
      setAgents(prev => prev.filter(agent => agent.brandId !== brandId)); // Also remove agents associated with the brand
    } catch (error) {
      console.error("Error deleting brand:", error);
    }
  }, []);

  const addAgent = useCallback(async (newAgent) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent),
      });
      const data = await response.json();
      setAgents(prev => [...prev, data]);
    } catch (error) {
      console.error("Error adding agent:", error);
    }
  }, []);

  const updateAgent = useCallback(async (updatedAgent) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${updatedAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAgent),
      });
      const data = await response.json();
      setAgents(prev => prev.map(agent => agent.id === data.id ? data : agent));
    } catch (error) {
      console.error("Error updating agent:", error);
    }
  }, []);

  const deleteAgent = useCallback(async (agentId) => {
    try {
      await fetch(`${API_BASE_URL}/agents/${agentId}`, {
        method: 'DELETE',
      });
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
      if (currentAgentId === agentId) {
        setCurrentAgentId(null); // Deselect if the deleted agent was current
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  }, [currentAgentId]);

  const addDevice = useCallback(async (newDevice) => {
    try {
      console.log("Sending addDevice request to backend:", newDevice);
      const response = await fetch(`${API_BASE_URL}/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDevice),
      });
      const data = await response.json();
      console.log("addDevice response from backend:", data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add device.');
      }
      setDevices(prev => [...prev, data]);
    } catch (error) {
      console.error("Error adding device:", error);
      throw error; // Re-throw to be caught by UI component
    }
  }, []);

  const deleteDevice = useCallback(async (phoneNumber) => {
    try {
      console.log("Sending deleteDevice request for phoneNumber:", phoneNumber);
      const deviceToDelete = devices.find(d => d.phoneNumber === phoneNumber);
      if (deviceToDelete) {
        const response = await fetch(`${API_BASE_URL}/devices/${deviceToDelete.id}`, {
          method: 'DELETE',
        });
        console.log("deleteDevice response from backend:", response);
        if (!response.ok) {
          throw new Error('Failed to delete device.');
        }
        setDevices(prev => prev.filter(device => device.phoneNumber !== phoneNumber));
      }
    } catch (error) {
      console.error("Error deleting device:", error);
      throw error; // Re-throw to be caught by UI component
    }
  }, [devices]);

  const checkRcsCapability = useCallback(async (msisdn) => {
    try {
      console.log("Sending checkRcsCapability request for MSISDN:", msisdn);
      // Assuming backend expects agentId in the request body
      const selectedAgentId = currentAgentId; // Get the currently selected agent ID
      if (!selectedAgentId) {
        throw new Error("Agent ID is required for checking RCS capability.");
      }
      const response = await fetch(`${API_BASE_URL}/check-rcs-capability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msisdn, agentId: selectedAgentId }),
      });
      const data = await response.json();
      console.log("checkRcsCapability response from backend:", data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check RCS capability.');
      }
      console.log("checkRcsCapability raw response data from backend:", JSON.stringify(data, null, 2));
      const isRcsCapable = data.isRcsCapable;
      const rcsFeaturesArray = (data && data.features) ? data.features : [];
      console.log("Calculated isRcsCapable:", isRcsCapable);
      console.log("Extracted features:", rcsFeaturesArray);
      return { isRcsCapable, features: rcsFeaturesArray };
    } catch (error) {
      console.error("Error checking RCS capability:", error);
      return false; // Assume not capable on error
    }
  }, [currentAgentId]);

  const sendTestMessage = useCallback(async (msisdn, message, richCardData, carouselData) => {
    try {
      console.log("Sending sendTestMessage request for MSISDN:", msisdn, "message:", message, "richCardData:", richCardData, "carouselData:", carouselData);
      const selectedAgentId = currentAgentId; // Get the currently selected agent ID
      if (!selectedAgentId) {
        throw new Error("Agent ID is required for sending test messages.");
      }

      let bodyPayload = { msisdn, agentId: selectedAgentId };

      if (richCardData) {
        bodyPayload.richCardData = richCardData;
      } else if (carouselData) {
        bodyPayload.carouselData = carouselData;
      } else {
        bodyPayload.message = message;
      }

      const response = await fetch(`${API_BASE_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      const data = await response.json();
      console.log("sendTestMessage response from backend:", data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }
      return data.success; // true or false
    } catch (error) {
      console.error("Error sending test message:", error);
      return false; // Assume failure on error
    }
  }, [currentAgentId]);

  const handleSignIn = useCallback(() => {
    // Mock Google Sign-In
    setAccessToken({ access_token: 'mock_access_token_123', expires_in: 3600 });
    setProfile({ email: 'mock.user@example.com', name: 'Mock User' });
    alert("Mock Sign-In Successful!");
  }, []);

  const value = {
    partnerInfo,
    googleRCSConfig,
    partnerUsers,
    serviceAccountKeys,
    brands,
    agents,
    devices,
    currentAgentId,
    googleClientId,
    rbmPartnerId,
    accessToken,
    profile,
    sampleAnalyticsData,
    sampleAgentHistory,
    currentAgent,
    analyticsMenu,
    messages,
    fetchDevices, // Add this line
    fetchMessages,
    setCurrentAgentId,
    setGoogleClientId,
    setRbmPartnerId,
    updatePartnerInfo,
    addPartnerUser,
    updatePartnerUser,
    removePartnerUser,
    addServiceAccountKey,
    deleteServiceAccountKey,
    updateGoogleRCSConfig,
    clearAllData,
    addBrand,
    updateBrand,
    deleteBrand,
    addAgent,
    updateAgent,
    deleteAgent,
    addDevice,
    deleteDevice,
    checkRcsCapability,
    sendTestMessage,
    handleSignIn,
    refreshData,
  };

  return (
    <RcsDataContext.Provider value={value}>
      {children}
    </RcsDataContext.Provider>
  );
};

export const useRcsData = () => useContext(RcsDataContext);
