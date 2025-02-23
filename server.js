const os = require('os')
const fs = require('fs')
const url = require('url')
const path = require('path')
const https = require('https')
const WebSocket = require('ws')
const { Transform } = require('stream')

const baseDirectory = __dirname

const validExtensions = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.geojson': 'application/json',
  '.bin': 'application/octet-stream',
  '.css': 'text/css',
  '.txt': 'text/plain',
  '.bmp': 'image/bmp',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.dae': 'application/vnd.oipf.dae.svg+xml',
  '.pbf': 'application/octet-stream',
  '.mtl': 'model/mtl',
  '.obj': 'model/obj',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.fbx': 'application/octet-stream',
  '.ttf': 'application/octet-stream',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function getLocalIPv4() {
  const interfaces = os.networkInterfaces()
  const ipv4Addresses = []
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        ipv4Addresses.push(details.address)
      }
    }
  }
  return ipv4Addresses
}

const ipAddresses = getLocalIPv4()
const PORT = 8443
const SERVER_IP_ADDRESS = (ipAddresses.length > 0 ? ipAddresses[0] : 'localhost') + ':' + PORT

// openssl req -nodes -new -x509 -keyout key.pem -out cert.pem -days 365

const server = https.createServer(
  {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  },
  (request, response) => {
    try {
      let pathname = url.parse(request.url).pathname
      pathname = pathname === '/' ? '/receiver.html' : pathname
      let fsPath = path.join(baseDirectory, path.normalize(pathname))
      let ext = path.extname(fsPath)

      if (!validExtensions[ext]) {
        response.writeHead(403)
        response.end('Forbidden')
        return
      }

      const fileStream = fs.createReadStream(fsPath)

      response.setHeader('Content-Type', validExtensions[ext])
      response.writeHead(200)

      if (ext === '.html') {
        const transformStream = new Transform({
          transform(chunk, encoding, callback) {
            const modifiedChunk = chunk.toString().replace(/SERVER_IP_ADDRESS/g, SERVER_IP_ADDRESS)
            callback(null, modifiedChunk)
          },
        })
        fileStream.pipe(transformStream).pipe(response)
      } else {
        fileStream.pipe(response)
      }

      fileStream.on('error', (err) => {
        console.error('File read error:', err)
        response.writeHead(404)
        response.end()
      })
    } catch ({ stack }) {
      response.writeHead(500)
      response.end()
      console.log(stack)
    }
  },
)

const wss = new WebSocket.Server({ server, path: '/ws' })

const clients = new Map()

wss.on('connection', (ws, req) => {
  const protocol = req.headers['sec-websocket-protocol']?.toLowerCase()
  const sessionId = crypto.randomUUID()

  clients.set(ws, { sessionId, protocol })
  console.log(`connected ${protocol} sessionId: ${sessionId}`)

  if (protocol === 'receiver') {
    const transceivers = Array.from(clients.values())
      .filter((client) => client.protocol === 'transceiver')
      .map((client) => client.sessionId)
    ws.send(JSON.stringify({ type: 'session', sessionId, transceivers }))
  } else if (protocol === 'transceiver') {
    ws.send(JSON.stringify({ type: 'session', sessionId }))
  }

  ws.on('message', (message) => {
    const text = message.toString('utf-8')
    console.log(`⬇️⬇️⬇️ Incoming message ${protocol} :`, text)
    const data = JSON.parse(text)
    const { ws1Id, ws2Id } = data

    if (protocol === 'receiver') {
      const [transceiverWs] = Array.from(clients.entries()).find(([ws, client]) => client.protocol === 'transceiver' && client.sessionId === ws1Id) || []
      if (transceiverWs && transceiverWs.readyState === WebSocket.OPEN) {
        transceiverWs.send(text)
        console.log(`⬆️⬆️⬆️ Outgoing message transceiver`)
      } else {
        ws.send(JSON.stringify({ type: 'system', meseage: 'transceiver is not open' }))
      }
    } else if (protocol === 'transceiver') {
      const [receiverWs] = Array.from(clients.entries()).find(([ws, client]) => client.protocol === 'receiver' && client.sessionId === ws2Id) || []
      if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
        receiverWs.send(text)
        console.log(`⬆️⬆️⬆️ Outgoing message receiver`)
      } else {
        ws.send(JSON.stringify({ type: 'system', meseage: 'receiver is not open' }))
      }
    }
  })

  ws.on('close', () => {
    const { sessionId, protocol } = clients.get(ws)
    clients.delete(ws)
    console.log(`disconnected ${protocol} sessionId: ${sessionId}`)
  })
})

// ?mode=edit
server.listen(PORT, () => {
  console.log(`WebRTC receiver page link: https://${SERVER_IP_ADDRESS}/`)
  console.log(`WebRTC transceiver page link: https://${SERVER_IP_ADDRESS}/transceiver.html`)
  console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/webaudio-output/index.html?protocol=receiver`)
  console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/webaudio-output/index.html?protocol=transceiver`)
  // console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/video-analyzer/index.html`)
  // console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/record/index.html`)
  // console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/resolution/index.html`)
  // console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/pan-tilt-zoom/index.html`)
  // console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/exposure/index.html`)
  // console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/endtoend-encryption/index.html`)
})
