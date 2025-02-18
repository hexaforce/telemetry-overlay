// const express = require('express')
const fs = require('fs')
const https = require('https')
const url = require('url')
const WebSocket = require('ws')
const os = require('os')
const { Transform } = require('stream')

const path = require('path')

const PORT = 8443

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
    } catch (e) {
      response.writeHead(500)
      response.end()
      console.log(e.stack)
    }
  },
)

const wss = new WebSocket.Server({ server, path: '/ws' })

let receiver = null
let transceiver = null
const CLOSE_PAIR_ON_DISCONNECT = false

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
const SERVER_IP_ADDRESS = (ipAddresses.length > 0 ? ipAddresses[0] : 'localhost') + ':' + PORT

const MediaOn = 'MediaOn'
const MediaReady = 'MediaReady'

wss.on('connection', (ws, req) => {
  const protocol = req.headers['sec-websocket-protocol']?.toLowerCase()
  if (protocol === 'receiver') {
    receiver = ws
  } else if (protocol === 'transceiver') {
    transceiver = ws
  }
  console.log(`${protocol} connected`)

  ws.on('message', (message) => {
    const text = message.toString('utf-8')
    console.log(`⬇️⬇️⬇️ Incoming message ${protocol} :`, JSON.parse(text))
    if (protocol === 'receiver' && transceiver) {
      transceiver.send(text)
      console.log(`⬆️⬆️⬆️ Outgoing message transceiver`)
    } else if (protocol === 'transceiver' && receiver) {
      receiver.send(text)
      console.log(`⬆️⬆️⬆️ Outgoing message receiver`)
    }
  })

  ws.on('close', () => {
    if (ws === receiver) {
      receiver = null
      if (CLOSE_PAIR_ON_DISCONNECT && transceiver) transceiver.close()
    } else if (ws === transceiver) {
      transceiver = null
      if (CLOSE_PAIR_ON_DISCONNECT && receiver) receiver.close()
    }
    console.log(`${protocol} disconnected`)
  })
})

server.listen(PORT, () => {
  console.log(`WebRTC receiver page link: https://${SERVER_IP_ADDRESS}/`)
  console.log(`WebRTC transceiver page link: https://${SERVER_IP_ADDRESS}/transceiver.html`)
  console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/webaudio-output/index.html`)
  console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/video-analyzer/index.html`)
  console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/record/index.html`)
  console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/resolution/index.html`)
  console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/pan-tilt-zoom/index.html`)
  console.log(`WebRTC visual page link: https://${SERVER_IP_ADDRESS}/exposure/index.html`)
})
