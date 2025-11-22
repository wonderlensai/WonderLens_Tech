import { createClient } from 'redis';

// Initialize Redis client (will be reused across requests)
let redisClient = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });
    
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  }
  return redisClient;
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, company, email, phone, industry, useCase } = req.body;

    // Validate required fields
    if (!name || !email || !company) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Redis client
    const client = await getRedisClient();

    // Create unique submission ID
    const submissionId = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare submission data
    const submissionData = {
      id: submissionId,
      timestamp: new Date().toISOString(),
      name,
      company,
      email,
      phone: phone || '',
      industry: industry || '',
      useCase: useCase || '',
    };

    // Store submission in Redis (as JSON string)
    await client.set(`submission:${submissionId}`, JSON.stringify(submissionData));
    
    // Add to submissions list for easy retrieval (sorted by timestamp)
    await client.zAdd('submissions:timeline', {
      score: Date.now(),
      value: submissionId
    });

    // Also store by company for easy lookup
    if (company) {
      const companyKey = `company:${company.toLowerCase().replace(/\s+/g, '-')}`;
      await client.sAdd(companyKey, submissionId);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Demo request submitted successfully!',
      submissionId: submissionId
    });

  } catch (error) {
    console.error('Error storing form submission:', error);
    return res.status(500).json({ 
      error: 'Failed to submit form. Please try again later.' 
    });
  }
}
