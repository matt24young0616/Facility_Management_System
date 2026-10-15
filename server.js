// server.js
import 'dotenv/config';
console.log('Username:', process.env.ARCGIS_USERNAME);
console.log('Password loaded:', !!process.env.ARCGIS_PASSWORD);
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/getToken', async (req, res) => {
  try {
    //const username = 'matt24youngdev';
    //const password = 'Nascar06160614!';
    const username = process.env.ARCGIS_USERNAME;
    const password = process.env.ARCGIS_PASSWORD;
    console.log('Username loaded:', username);
    console.log('Password loaded:', password ? 'YES' : 'NO');
    const tokenUrl = 'https://www.arcgis.com/sharing/rest/generateToken';

    const params = new URLSearchParams();
    params.append('f', 'json');
    params.append('username', username);
    params.append('password', password);
    params.append('expiration', '60');    // token valid for 60 minutes
    params.append('client', 'requestip'); // for web apps

    const response = await fetch(tokenUrl, {
      method: 'POST',
      body: params
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json(data.error);
    }

    res.json(data); // { token, expires, ssl, ... }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Token request failed' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});