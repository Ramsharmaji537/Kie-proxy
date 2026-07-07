const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json({ limit: '50mb' }));

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
  res.json({ status: 'ok', message: 'Kling Proxy v3 Running' });
});

// Kie.ai Forward
app.all('/kie/*', async function(req, res) {
  try {
    var targetUrl = 'https://api.kie.ai/api/v1' + req.url.replace('/kie', '');
    console.log('[KIE] ' + req.method + ' ' + targetUrl);
    var options = {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': 'application/json'
      }
    };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
    }
    var response = await fetch(targetUrl, options);
    var text = await response.text();
    console.log('[KIE RESP] ' + response.status + ' ' + text.substring(0, 150));
    res.status(response.status);
    try { res.json(JSON.parse(text)); } catch(e) { res.send(text); }
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Kling Direct Forward
app.all('/kling/*', async function(req, res) {
  try {
    var targetUrl = 'https://api.klingai.com' + req.url.replace('/kling', '');
    console.log('[KLING] ' + req.method + ' ' + targetUrl);
    var options = {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': 'application/json'
      }
    };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
    }
    var response = await fetch(targetUrl, options);
    var text = await response.text();
    console.log('[KLING RESP] ' + response.status + ' ' + text.substring(0, 150));
    res.status(response.status);
    try { res.json(JSON.parse(text)); } catch(e) { res.send(text); }
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

// Generic Forward (default to Kie.ai)
app.all('*', async function(req, res) {
  try {
    var targetUrl = 'https://api.kie.ai/api/v1' + req.url;
    console.log('[DEFAULT] ' + req.method + ' ' + targetUrl);
    var options = {
      method: req.method,
      headers: {
        'Authorization': req.headers.authorization || '',
        'Content-Type': req.headers['content-type'] || 'application/json',
        'Accept': 'application/json'
      }
    };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      options.body = JSON.stringify(req.body);
    }
    var response = await fetch(targetUrl, options);
    var text = await response.text();
    console.log('[DEFAULT RESP] ' + response.status);
    res.status(response.status);
    try { res.json(JSON.parse(text)); } catch(e) { res.send(text); }
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('✅ Kling Proxy v3 running on port ' + PORT);
});
