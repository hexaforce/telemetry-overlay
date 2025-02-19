const $ = (id) => document.getElementById(id)
const d = document.documentElement

const MediaOn = 'MediaOn'
const MediaReady = 'MediaReady'

var ws
var pc
var dc

import { renderMap } from './navigation-map.js'
import { StreamVisualizer } from './webaudio-output/StreamVisualizer.js'

const sendData = (data) => {
  console.log('sendData:', data)
  if (dc && dc.readyState == 'open') dc.send(JSON.stringify(data))
}

// --- Codec --------------------------

const preferredOrderAudio = ['audio/opus', 'audio/G722', 'audio/PCMU', 'audio/PCMA']
const preferredOrderVideo = ['video/H264', 'video/VP8', 'video/AV1', 'video/VP9', 'video/H265']

export function preferredCodecs(transceivers) {
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

// 42001f	Baseline Profile
// 42e01f	Constrained Baseline Profile
// 4d001f	Main Profile
// f4001f	High Profile
// 64001f	High Profile (Level 3.1)
export function fixH264Codecs(transceivers, profileLevelId = '42001f', packetizationMode = '1') {
  transceivers.forEach((transceiver) => {
    const kind = transceiver.receiver.track.kind
    const codecs = RTCRtpReceiver.getCapabilities(kind).codecs
    let filteredCodecs
    if (kind === 'video') {
      filteredCodecs = codecs.filter((codec) => codec.mimeType === 'video/H264' && codec.sdpFmtpLine.includes(`profile-level-id=${profileLevelId}`) && codec.sdpFmtpLine.includes(`packetization-mode=${packetizationMode}`))
    } else if (kind === 'audio') {
      filteredCodecs = codecs.filter((codec) => codec.mimeType === 'audio/opus')
    }
    transceiver.setCodecPreferences(filteredCodecs)
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
  ws.onmessage = onmessage
}

// --- Media Receiver --------------------------

const OfferOptions = { offerToReceiveAudio: true, offerToReceiveVideo: true }

const setupReceiver = (wsUrl) => {
  ws = new WebSocket(wsUrl, 'receiver')
  ws.onopen = () => ws.send(JSON.stringify({ type: MediaOn }))
  ws.onmessage = onmessage
}

async function onmessage({ data }) {
  if (!data) return
  const msg = JSON.parse(data)
  if (!msg) return

  if (!pc) {
    pc = new RTCPeerConnection()
    pc.onicecandidate = ({ candidate }) => candidate && ws.send(JSON.stringify({ type: 'ice', candidate }))
    dc = pc.createDataChannel(ws.protocol)
  }

  if (msg.type === MediaOn) {
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
  } else if (msg.type === MediaReady) {
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
      if (track.kind === 'audio') {
        new StreamVisualizer(streams[0], document.querySelector('canvas')).start()
      }
      if (streamElement.srcObject !== streams[0]) {
        streamElement.srcObject = streams[0]
      }
    }
    ws.onclose = () => streamElement.srcObject.getTracks().forEach((track) => track.stop())

    const offer = await pc.createOffer(OfferOptions)
    await pc.setLocalDescription(offer)
    ws.send(JSON.stringify(offer))
  } else if (msg.type === 'offer') {
    await pc.setRemoteDescription(msg)
    // preferredCodecs(pc.getTransceivers())
    fixH264Codecs(pc.getTransceivers())
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    ws.send(JSON.stringify(answer))
  } else if (msg.type === 'answer') {
    await pc.setRemoteDescription(msg)
  } else if (msg.type === 'ice') {
    await pc.addIceCandidate(msg.candidate)
  }
}

// --- GPS Send Position --------------------------

const sendPosition = async (timeout) => {
  console.log('sendPosition start')
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
