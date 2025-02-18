const express = require('express')
const fs = require('fs')
const https = require('https')
const WebSocket = require('ws')
const os = require('os')
const path = require('path')
const mime = require('mime-types')

const PORT = 8443
const app = express()

const options = {
  // openssl req -nodes -new -x509 -keyout key.pem -out cert.pem -days 365
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
}

const server = https.createServer(options, app)
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

    if (text === MediaOn || text === MediaReady){
      console.log(`Incoming message ${protocol} :`, text)
    } else {
      console.log(`Incoming message ${protocol} :`, JSON.parse(text))
    }
    
    if (protocol === 'receiver' && transceiver) {
      transceiver.send(text)
      console.log(`Outgoing message transceiver`)
    } else if (protocol === 'transceiver' && receiver) {
      receiver.send(text)
      console.log(`Outgoing message receiver`)
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

app.use((req, res) => {
  let filePath = path.join(__dirname, decodeURIComponent(req.path === '/' ? '/receiver.html' : req.path))
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send('Not Found')
    } else {
      res.setHeader('Content-Type', mime.lookup(filePath) || 'application/octet-stream')
      let content = data.toString()
      if (filePath.endsWith('.html')) {
        content = content.replace(/SERVER_IP_ADDRESS/g, SERVER_IP_ADDRESS)
      }
      res.send(content)
    }
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
