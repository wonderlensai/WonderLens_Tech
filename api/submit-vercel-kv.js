// Vercel KV Storage Implementation
// Install: npm install @vercel/kv

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, company, email, phone, industry, useCase } = req.body;

    if (!name || !email || !company) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create unique ID
    const submissionId = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
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

    // Store in Vercel KV
    await kv.set(`submission:${submissionId}`, submissionData);
    
    // Add to list for easy retrieval
    await kv.lpush('submissions:list', submissionId);

    return res.status(200).json({ 
      success: true, 
      message: 'Demo request submitted successfully!' 
    });

  } catch (error) {
    console.error('Error storing form:', error);
    return res.status(500).json({ 
      error: 'Failed to submit form. Please try again later.' 
    });
  }
}

