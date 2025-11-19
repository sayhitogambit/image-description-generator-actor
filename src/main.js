import { Actor } from 'apify';
import axios from 'axios';

await Actor.main(async () => {
    const input = await Actor.getInput();
    if (!input?.imageUrl) throw new Error('Image URL is required');
    if (!input?.openrouterApiKey) throw new Error('API key is required');

    const { imageUrl, detailLevel = 'detailed', includeObjects = true, includeColors = true, model = 'openai/gpt-4o', openrouterApiKey } = input;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model,
        messages: [{
            role: 'user',
            content: [
                { type: 'image_url', image_url: { url: imageUrl } },
                { type: 'text', text: `Describe this image in ${detailLevel} detail. ${includeObjects ? 'List all objects.' : ''} ${includeColors ? 'Describe colors.' : ''} Return JSON: {"description": "string", "objects": [], "colors": [], "mood": "string"}` }
            ]
        }],
        response_format: { type: 'json_object' }
    }, {
        headers: { 'Authorization': `Bearer ${openrouterApiKey}`, 'HTTP-Referer': 'https://apify.com' }
    });

    const result = JSON.parse(response.data.choices[0].message.content);
    await Actor.pushData({ ...result, imageUrl, cost: 0.01, chargePrice: 0.30, createdAt: new Date().toISOString() });
    console.log('✓ Image description generated!');
});
