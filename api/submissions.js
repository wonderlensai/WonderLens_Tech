import { createClient } from 'redis';

// Initialize Redis client
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
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await getRedisClient();

    // Get all submission IDs from timeline (sorted by timestamp, newest first)
    const submissionIds = await client.zRange('submissions:timeline', 0, -1, {
      REV: true // Reverse order (newest first)
    });

    // Fetch all submission data
    const submissions = [];
    for (const id of submissionIds) {
      const data = await client.get(`submission:${id}`);
      if (data) {
        submissions.push(JSON.parse(data));
      }
    }

    // Get statistics
    const totalCount = submissions.length;
    const companies = [...new Set(submissions.map(s => s.company))];

    return res.status(200).json({
      success: true,
      count: totalCount,
      companies: companies.length,
      submissions: submissions
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch submissions',
      details: error.message
    });
  }
}
