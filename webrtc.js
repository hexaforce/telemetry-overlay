const $ = (id) => document.getElementById(id)
const d = document.documentElement

const MediaOn = 'MediaOn'
const MediaReady = 'MediaReady'

var ws
var pc
var dc

import { renderMap } from './navigation-map.js'

const sendData = (data) => {
  console.log('sendData:', data)
  if (dc && dc.readyState == 'open') dc.send(JSON.stringify(data))
}

// --- Media --------------------------

import { StreamVisualizer } from './webaudio-output/StreamVisualizer.js'

const preferredOrderAudio = ['audio/opus', 'audio/G722', 'audio/PCMU', 'audio/PCMA']
const preferredOrderVideo = ['video/H264', 'video/VP8', 'video/AV1', 'video/VP9', 'video/H265']

export function preferredVideoCodecs(transceivers) {
  const sort = (supportedCodecs, preferredOrder) =>
    supportedCodecs.sort((a, b) => {
      const indexA = preferredOrder.indexOf(a.mimeType)
      const indexB = preferredOrder.indexOf(b.mimeType)
      const orderA = indexA >= 0 ? indexA : Number.MAX_VALUE
      const orderB = indexB >= 0 ? indexB : Number.MAX_VALUE
      return orderA - orderB
    })
  transceivers.forEach((transceiver) => {
    const kind = transceiver.receiver.track.kind
    const codecs = sort(RTCRtpReceiver.getCapabilities(kind).codecs, kind === 'video' ? preferredOrderVideo : preferredOrderAudio)
    transceiver.setCodecPreferences(codecs)
  })
}

// --- Media Transceiver --------------------------

async function getUserMedia() {
  const Constraints = {
    video: { frameRate: { ideal: 30, max: 60 }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  }
  Constraints.video.deviceId = { ideal: document.querySelector('select#videoSource').value }
  Constraints.audio.deviceId = { ideal: document.querySelector('select#audioSource').value }
  return await navigator.mediaDevices.getUserMedia(Constraints)
}

const setupTransceiver = (wsUrl) => {
  ws = new WebSocket(wsUrl, 'transceiver')

  ws.onmessage = async ({ data }) => {
    if (!data) return
    const msg = JSON.parse(data)
    if (!msg) return

    if (msg.type === MediaOn) {
      pc = new RTCPeerConnection()
      pc.onicecandidate = ({ candidate }) => candidate && ws.send(JSON.stringify({ type: 'ice', candidate }))
      dc = pc.createDataChannel(ws.protocol)
      dc.onopen = ({ target }) => {
        console.log('target: ', target)
        sendPosition()
      }
      dc.onmessage = ({ data }) => {
        const msg = JSON.parse(data)
        console.log('incoming:', msg)
      }

      const stream = await getUserMedia()
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      ws.onclose = () => stream.getTracks().forEach((track) => track.stop())

      ws.send(JSON.stringify({ type: MediaReady }))
    } else if (msg.type === 'offer') {
      await pc.setRemoteDescription(msg)
      preferredVideoCodecs(pc.getTransceivers())
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      ws.send(JSON.stringify(answer))
    } else if (msg.type === 'ice') {
      await pc.addIceCandidate(msg.candidate)
    }
  }

  navigator.mediaDevices.enumerateDevices().then((deviceArray) => {
    const videoSelect = document.querySelector('select#videoSource')
    const audioSelect = document.querySelector('select#audioSource')
    while (videoSelect.firstChild) videoSelect.removeChild(videoSelect.firstChild)
    while (audioSelect.firstChild) audioSelect.removeChild(audioSelect.firstChild)
    for (let i = 0; i < deviceArray.length; i++) {
      const { deviceId, kind, label } = deviceArray[i]
      const option = document.createElement('option')
      option.value = deviceId
      if (kind === 'videoinput') {
        option.text = label || `Camera ${videoSelect.length + 1}`
        videoSelect.appendChild(option)
      } else if (kind === 'audioinput') {
        option.text = label || `Microphone ${audioSelect.length + 1}`
        audioSelect.appendChild(option)
      }
    }
  })
}

// --- Media Receiver --------------------------

const OfferOptions = { offerToReceiveAudio: true, offerToReceiveVideo: true }

const setupReceiver = (wsUrl) => {
  ws = new WebSocket(wsUrl, 'receiver')
  ws.onopen = () => ws.send(JSON.stringify({ type: MediaOn }))

  ws.onmessage = async ({ data }) => {
    if (!data) return
    const msg = JSON.parse(data)
    if (!msg) return

    if (msg.type === MediaReady) {
      pc = new RTCPeerConnection()
      pc.onicecandidate = ({ candidate }) => candidate && ws.send(JSON.stringify({ type: 'ice', candidate }))
      pc.createDataChannel(ws.protocol)
      pc.ondatachannel = ({ channel }) => {
        console.log('channel: ', channel)
        dc = channel
        channel.onmessage = ({ data }) => {
          const msg = JSON.parse(data)
          console.log('incoming:', msg)
          if (msg.longitude && msg.latitude) {
            renderMap([msg.longitude, msg.latitude])
          }
        }
      }

      const streamElement = $('stream')
      pc.ontrack = ({ streams, track }) => {
        if (streamElement.srcObject !== streams[0]) {
          streamElement.srcObject = streams[0]
        }
      }
      ws.onclose = () => streamElement.srcObject.getTracks().forEach((track) => track.stop())

      const offer = await pc.createOffer(OfferOptions)
      await pc.setLocalDescription(offer)
      ws.send(JSON.stringify(offer))
    } else if (msg.type === 'answer') {
      await pc.setRemoteDescription(msg)
    } else if (msg.type === 'ice') {
      await pc.addIceCandidate(msg.candidate)
    }
  }
}

// --- GPS Send Position --------------------------

const sendPosition = async (timeout) => {
  console.log("sendPosition start")
  window.navigator.geolocation.getCurrentPosition(
    ({ coords, timestamp }) => {
      const { accuracy, altitude, altitudeAccuracy, heading, latitude, longitude, speed } = coords
      sendData({ accuracy, altitude, altitudeAccuracy, heading, latitude, longitude, speed, timestamp })
    },
    (err) => {
      console.log('Error:', err)
      sendPosition(timeout)
    },
    timeout ? { enableHighAccuracy: true, timeout: timeout, maximumAge: 0 } : null,
  )
}

const sendOrientation = ({ isTrusted, absolute, alpha, beta, bubbles, cancelBubble, cancelable, composed, defaultPrevented, eventPhase, gamma, returnValue, timeStamp, type }) => {
  sendData({ isTrusted, absolute, alpha, beta, bubbles, cancelBubble, cancelable, composed, defaultPrevented, eventPhase, gamma, returnValue, timeStamp, type })
}

export { setupReceiver, setupTransceiver, sendOrientation }
