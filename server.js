const express = require('express')
const http = require('http')
const WebSocket = require('ws')
const fs = require('fs')
const os = require('os')
const path = require('path')

const PORT = 8000
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server, path: '/ws' })

let receiver = null
let transceiver = null

wss.on('connection', (ws, req) => {
  const protocol = req.headers['sec-websocket-protocol']

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
      // if (transceiver) transceiver.close()
      console.log('Receiver disconnected')
    } else if (ws === transceiver) {
      transceiver = null
      // if (receiver) receiver.close()
      console.log('Transceiver disconnected')
    }
  })
})

function getLocalIPv4() {
  const interfaces = os.networkInterfaces()
  const ipv4Addresses = new Set()
  for (const iface of Object.values(interfaces)) {
    for (const details of iface) {
      if (details.family === 'IPv4' && !details.internal) {
        ipv4Addresses.add(details.address)
      }
    }
  }
  return [...ipv4Addresses]
}

app.use((req, res) => {
  let filePath = path.join(__dirname, req.path === '/' ? '/index.html' : req.path)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send('Not Found')
    } else {
      if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css; charset=utf-8')
      if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
      if (filePath.endsWith('.ico')) res.setHeader('Content-Type', 'image/x-icon')
      if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        let content = data.toString()
        content = content.replace(/SERVER_IP_ADDRESS/g, SERVER_IP_ADDRESS)
        res.send(content)
        return
      }
      res.send(data)
    }
  })
})

var SERVER_IP_ADDRESS = 'localhost:' + PORT
server.listen(PORT, () => {
  SERVER_IP_ADDRESS = getLocalIPv4()[0] + ':' + PORT
  console.log(`WebRTC receiver page link: http://${SERVER_IP_ADDRESS}/receiver.html`)
  console.log(`WebRTC transceiver page link: http://${SERVER_IP_ADDRESS}/transceiver.html`)
})
