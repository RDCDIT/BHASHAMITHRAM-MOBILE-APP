const http = require('http');
const endpoints = [
  '/api/english-english',
  '/api/malayalam-malayalam/browse-malayalam',
  '/api/english-malayalam/browse-english',
  '/api/malayalam-english/browse-malayalam',
];

endpoints.forEach(path => {
  const req = http.get(`http://localhost:5000${path}`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const parsed = JSON.parse(data);
      const count = Array.isArray(parsed) ? parsed.length : (parsed.words ? parsed.words.length : 'object');
      console.log(`${path} -> count: ${count}, sample: ${data.slice(0,120)}`);
    });
  });
  req.on('error', (e) => console.log(`${path} -> ERROR: ${e.message}`));
  req.setTimeout(8000, () => { console.log(`${path} -> TIMEOUT`); req.destroy(); });
});
