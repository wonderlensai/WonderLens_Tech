// Alternative API route using Google Apps Script webhook
// Use this if you prefer the simpler webhook approach

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, company, email, phone, industry, useCase } = req.body;

    if (!name || !email || !company) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const webhookUrl = process.env.GOOGLE_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        company,
        email,
        phone: phone || '',
        industry: industry || '',
        useCase: useCase || '',
      }),
    });

    const result = await response.json();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Demo request submitted successfully!',
      });
    } else {
      return res.status(500).json({
        error: result.error || 'Failed to submit form',
      });
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    return res.status(500).json({
      error: 'Failed to submit form. Please try again later.',
    });
  }
}
