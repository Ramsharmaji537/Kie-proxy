const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json({ limit: '50mb' }));

// SAHI BASE URL!
const KIE_BASE = 'https://api.kie.ai/api/v1';

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check
app.get('/', async function(req, res) {
  res.json({ status: 'ok', message: 'Kie Proxy v2 Running', apiBase: KIE_BASE });
});

// FORWARD ALL REQUESTS
app.all('*', async function(req, res) {
  try {
    var targetUrl = KIE_BASE + req.url;
    console.log('[FORWARD] ' + req.method + ' ' + targetUrl);

    var options = {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': 'application/json'
      },
      redirect: 'follow'
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    var response = await fetch(targetUrl, options);
    var text = await response.text();

    console.log('[RESPONSE] ' + response.status + ' Body: ' + text.substring(0, 200));

    res.status(response.status);
    try {
      res.json(JSON.parse(text));
    } catch(e) {
      res.send(text);
    }
  } catch(error) {
    console.error('[ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('✅ Kie Proxy v2 running on port ' + PORT);
  console.log('✅ Forwarding to: ' + KIE_BASE);
});
