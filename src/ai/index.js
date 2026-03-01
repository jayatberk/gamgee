const https = require('https');

const messages = [
  {
    role: 'system',
    content: 'You are a helpful desktop AI assistant. The user will share screenshots of their screen and ask questions or request help. Answer concisely and clearly.',
  },
];

function callGpt41(imageBase64, prompt) {
  messages.push({
    role: 'user',
    content: [
      {
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
      },
      {
        type: 'text',
        text: prompt,
      },
    ],
  });

  const body = JSON.stringify({ model: 'gpt-4.1', messages });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const data = JSON.parse(Buffer.concat(chunks).toString());
        if (data.error) {
          messages.pop();
          reject(new Error(data.error.message));
          return;
        }
        const reply = data.choices[0].message.content;
        messages.push({ role: 'assistant', content: reply });
        resolve(reply);
      });
    });

    req.on('error', (err) => {
      messages.pop();
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

function resetConversation() {
  messages.splice(1);
}

module.exports = {
  callGpt41,
  resetConversation,
};
