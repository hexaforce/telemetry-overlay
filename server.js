const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const fs = require('fs')
const os = require('os')
const path = require('path')
const mime = require('mime-types')

const PORT = 8000
const app = express()
const server = http.createServer(app)
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

wss.on('connection', (ws, req) => {
  const protocol = req.headers['sec-websocket-protocol']?.toLowerCase()

  if (protocol === 'receiver') {
    receiver = ws
    console.log('Receiver connected')
  } else if (protocol === 'transceiver') {
    transceiver = ws
    console.log('Transceiver connected')
  }

  ws.on('message', (message) => {
    const text = message.toString('utf-8')
    if (protocol === 'receiver' && transceiver) {
      transceiver.send(text)
    } else if (protocol === 'transceiver' && receiver) {
      receiver.send(text)
    }
  })

  ws.on('close', () => {
    if (ws === receiver) {
      receiver = null
      console.log('Receiver disconnected')
      if (CLOSE_PAIR_ON_DISCONNECT && transceiver) transceiver.close()
    } else if (ws === transceiver) {
      transceiver = null
      console.log('Transceiver disconnected')
      if (CLOSE_PAIR_ON_DISCONNECT && receiver) receiver.close()
    }
  })
})

app.use((req, res) => {
  let filePath = path.join(__dirname, decodeURIComponent(req.path === '/' ? '/index.html' : req.path))
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
  console.log(`WebRTC receiver page link: http://${SERVER_IP_ADDRESS}/receiver.html`)
  console.log(`WebRTC transceiver page link: http://${SERVER_IP_ADDRESS}/transceiver.html`)
})
