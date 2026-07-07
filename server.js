const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'Proxy OK!' });
});

// ALL requests proxy karo
app.all('/*', async (req, res) => {
  try {
    const path = req.path;
    const kieUrl = 'https://kie.ai/api/v1' + path;
    
    console.log(`→ ${req.method} ${kieUrl}`);
    console.log(`→ Body: ${JSON.stringify(req.body).substring(0,100)}`);

    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers['authorization'] || '',
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
      }
    };

    if (req.method !== 'GET') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(kieUrl, fetchOptions);
    const text = await response.text();
    
    console.log(`← Status: ${response.status}`);
    console.log(`← Response: ${text.substring(0,200)}`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(response.status).send(text);

  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.options('/*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.status(200).end();
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running: ${PORT}`);
});
