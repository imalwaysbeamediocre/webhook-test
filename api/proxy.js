export default async function handler(req, res) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const { type, message, username, embeds } = req.body;
    
    // Webhook mapping - replace these with YOUR actual Discord webhooks
    const WEBHOOKS = {
        'logs': process.env.WEBHOOK_LOGS,
        'admin': process.env.WEBHOOK_ADMIN,
        'errors': process.env.WEBHOOK_ERRORS
    };
    
    const webhookUrl = WEBHOOKS[type];
    
    if (!webhookUrl) {
        return res.status(404).json({ error: 'Invalid webhook type' });
    }
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message,
                username: username || 'Protected Bot',
                embeds: embeds || [],
                allowed_mentions: { parse: [] }
            })
        });
        
        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ error: 'Discord API error' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
