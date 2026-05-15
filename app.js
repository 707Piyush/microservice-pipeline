const http = require('http');

const PORT = process.env.PORT || 3000;
const VERSION = process.env.VERSION || "v2";
const SERVICE_NAME = process.env.SERVICE_NAME || "microservice-app";

let isReady = false;

setTimeout(() => {
  isReady = true;
  console.log("Service is ready to accept traffic");
}, 2000);

const homePage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${SERVICE_NAME}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      max-width: 600px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .badge {
      display: inline-block;
      background: #4ade80;
      color: #000;
      font-size: 12px;
      font-weight: bold;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    h1 {
      font-size: 2.2rem;
      font-weight: 700;
      margin-bottom: 10px;
      background: linear-gradient(90deg, #a78bfa, #60a5fa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p.subtitle {
      color: rgba(255,255,255,0.6);
      font-size: 1rem;
      margin-bottom: 30px;
    }

    .cards {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 30px;
    }

    .card {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 16px 24px;
      min-width: 140px;
    }

    .card .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 6px;
    }

    .card .value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #a78bfa;
    }

    .links {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .links a {
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(90deg, #a78bfa, #60a5fa);
      color: white;
    }

    .btn-secondary {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.8);
      border: 1px solid rgba(255,255,255,0.15);
    }

    .links a:hover {
      transform: translateY(-2px);
      opacity: 0.85;
    }

    footer {
      margin-top: 30px;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Live</div>
    <h1>Microservice Pipeline</h1>
    <p class="subtitle">Deployed via Jenkins + Docker + Kubernetes</p>

    <div class="cards">
      <div class="card">
        <div class="label">Version</div>
        <div class="value">${VERSION}</div>
      </div>
      <div class="card">
        <div class="label">Service</div>
        <div class="value">${SERVICE_NAME}</div>
      </div>
      <div class="card">
        <div class="label">Status</div>
        <div class="value" style="color:#4ade80">Running</div>
      </div>
    </div>

    <div class="links">
      <a href="/health" class="btn-primary">Health Check</a>
      <a href="/ready" class="btn-secondary">Readiness</a>
      <a href="/info" class="btn-secondary">App Info</a>
    </div>

    <footer>Powered by Node.js &bull; Containerized with Docker &bull; Orchestrated by Kubernetes</footer>
  </div>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  const { url, method } = req;
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);

  if (url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(homePage);
    return;
  }

  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', version: VERSION }));
    return;
  }

  if (url === '/ready') {
    const code = isReady ? 200 : 503;
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: isReady ? 'READY' : 'NOT READY' }));
    return;
  }

  if (url === '/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: SERVICE_NAME,
      version: VERSION,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route not found' }));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`[${SERVICE_NAME}] v${VERSION} running on port ${PORT}`);
});
