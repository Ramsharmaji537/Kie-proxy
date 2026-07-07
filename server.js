const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json({ limit: '50mb' }));

const KIE_BASE = 'https://kie.ai/api/v1/proxy';

// CORS - bahut zaroori
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check
app.get('/', async function(req, res) {
  try {
    var r = await fetch(KIE_BASE + '/account/balance', {
      headers: { 'Authorization': req.headers.authorization || '' }
    });
    var data = await r.json();
    res.json({ status: 'ok', balance: data });
  } catch(e) {
    res.json({ status: 'ok', message: 'Proxy running', error: e.message });
  }
});

// GENERIC FORWARDER - Yeh sab kuch forward karega!
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

    console.log('[RESPONSE] ' + response.status + ' (' + text.substring(0, 150) + ')');

    res.status(response.status);
    try {
      res.json(JSON.parse(text));
    } catch(e2) {
      res.send(text);
    }
  } catch(error) {
    console.error('[ERROR]', error.message);
    res.status(500).json({ error: error.message });
  }
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('✅ Proxy running on port ' + PORT);
  console.log('✅ Forwarding to: ' + KIE_BASE);
});
