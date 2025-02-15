const $ = (id) => document.getElementById(id)
const d = document.documentElement

import { renderMap } from './navigation-map.js'

// --- Data Channel --------------------------
const dataChannel = {}

const dataChannelHandler = (pc, PROTOCOL) => {
  pc.ondatachannel = ({ channel }) => {
    channel.onopen = ({ target }) => {
      dataChannel[target.label] = target
      if (PROTOCOL === 'transceiver' && target.label === 'receiver') {
        sendPosition(10000)
      }
    }
    channel.onmessage = ({ data }) => {
      const msg = JSON.parse(data)
      console.log('incoming:', msg)
      if (msg.longitude && msg.latitude) {
        renderMap([msg.longitude, msg.latitude])
      }
    }
  }
  const channel = pc.createDataChannel(PROTOCOL)
  channel.onopen = ({ target }) => (dataChannel[target.label] = target)
  // channel.onmessage = ({ data }) => {
  //   console.log('???:', data)
  // }
}

const sendData = (data) => {
  console.log('sendData:', data)
  dataChannel[PROTOCOL].send(JSON.stringify(data))
}

// --- Media --------------------------
var PROTOCOL = null

const setReceiverAnswerCodec = async (pc) => {
  const supportedCodecs = RTCRtpReceiver.getCapabilities('video').codecs
  const preferredOrder = ['video/H264', 'video/VP8', 'video/AV1', 'video/VP9', 'video/H265']
  const [audioTransceiver, videoTransceiver] = pc.getTransceivers()
  if (videoTransceiver) {
    videoTransceiver.setCodecPreferences(
      supportedCodecs.sort((a, b) => {
        const indexA = preferredOrder.indexOf(a.mimeType)
        const indexB = preferredOrder.indexOf(b.mimeType)
        const orderA = indexA >= 0 ? indexA : Number.MAX_VALUE
        const orderB = indexB >= 0 ? indexB : Number.MAX_VALUE
        return orderA - orderB
      }),
    )
  }
}

// --- Media Transceiver --------------------------

const videoSelect = document.querySelector('select#videoSource')
const audioSelect = document.querySelector('select#audioSource')

const Constraints = {
  video: { frameRate: { ideal: 30, max: 60 }, width: { ideal: 1920 }, height: { ideal: 1080 } },
  audio: { echoCancellation: true, noiseSuppression: true }
}

const setupTransceiver = (wsUrl) => {
  PROTOCOL = 'transceiver'
  var ws = new WebSocket(wsUrl, PROTOCOL)
  var pc
  ws.onopen = async () => console.log('opne ws')
  ws.onclose = async () => console.log('close ws')
  ws.onmessage = async ({ data }) => {
    const msg = JSON.parse(data)
    if (msg.OfferOptions) {
      const { offerToReceiveVideo, offerToReceiveAudio } = msg.OfferOptions
      Constraints.video.deviceId = { ideal: videoSelect.value }
      Constraints.audio.deviceId = { ideal: audioSelect.value }
      const stream = await navigator.mediaDevices.getUserMedia(Constraints)
      // pc = new RTCPeerConnection({ bundlePolicy: 'max-bundle' })
      pc = new RTCPeerConnection()
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))
      ws.onclose = () => stream.getTracks().forEach((track) => track.stop())
      pc.getTransceivers().forEach((transceiver) => (transceiver.direction = 'sendonly'))
      pc.onicecandidate = ({ candidate }) => ws.send(JSON.stringify(candidate))
      dataChannelHandler(pc, PROTOCOL)
      ws.send(JSON.stringify({ active: stream.active }))
    } else {
      if (msg.type) {
        // console.log('offer received:', msg.sdp)
        await pc.setRemoteDescription(msg)
        setReceiverAnswerCodec(pc)
        const answer = await pc.createAnswer()
        // console.log('answer:', answer.sdp)
        await pc.setLocalDescription(answer)
        ws.send(JSON.stringify(answer))
      } else {
        // console.log('ice:', msg)
        await pc.addIceCandidate(msg)
      }
    }
  }
  navigator.mediaDevices.enumerateDevices().then((deviceArray) => {
    while (videoSelect.firstChild) {
      videoSelect.removeChild(videoSelect.firstChild)
    }
    while (audioSelect.firstChild) {
      audioSelect.removeChild(audioSelect.firstChild)
    }
    for (let i = 0; i < deviceArray.length; i++) {
      const { deviceId, kind, label } = deviceArray[i]
      if (kind === 'videoinput') {
        const option = document.createElement('option')
        option.value = deviceId
        option.text = label || `Camera ${videoSelect.length + 1}`
        videoSelect.appendChild(option)
      } else if (kind === 'audioinput') {
        const option = document.createElement('option')
        option.value = deviceId
        option.text = label || `Microphone ${audioSelect.length + 1}`
        audioSelect.appendChild(option)
      }
    }
  })

}

// --- Media Receiver --------------------------

const setupReceiver = (wsUrl) => {
  PROTOCOL = 'receiver'
  var ws = new WebSocket(wsUrl, PROTOCOL)
  var pc
  const OfferOptions = { offerToReceiveAudio: true, offerToReceiveVideo: true }
  ws.onopen = async () => {
    console.log('opne ws')
    ws.send(JSON.stringify({ OfferOptions }))
  }
  ws.onclose = async () => console.log('close ws')
  ws.onmessage = async ({ data }) => {
    const msg = JSON.parse(data)
    if (msg.active) {
      // pc = new RTCPeerConnection({ bundlePolicy: 'max-bundle' })
      pc = new RTCPeerConnection()
      pc.onicecandidate = ({ candidate }) => ws.send(JSON.stringify(candidate))
      dataChannelHandler(pc, PROTOCOL)
      // setMediaReceiver($('stream'), pc, ws)
      pc.ontrack = ({ streams }) => ($('stream').srcObject = streams[0])
      ws.onclose = () => $('stream').srcObject.getTracks().forEach((track) => track.stop())
      pc.getTransceivers().forEach((transceiver) => (transceiver.direction = 'recvonly'))
      const offer = await pc.createOffer(OfferOptions)
      // console.log('offer:', offer.sdp)
      await pc.setLocalDescription(offer)
      ws.send(JSON.stringify(offer))
    } else {
      if (msg.type) {
        // console.log('answer:', msg.sdp)
        await pc.setRemoteDescription(msg)
      } else {
        // console.log('ice:', msg)
        await pc.addIceCandidate(msg)
      }
    }
  }
}

// --- GPS Send Position --------------------------

const sendPosition = async (timeout) => {
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

// const sendOrientation = ({ isTrusted, absolute, alpha, beta, bubbles, cancelBubble, cancelable, composed, defaultPrevented, eventPhase, gamma, returnValue, timeStamp, type }) => {
//   sendData({ isTrusted, absolute, alpha, beta, bubbles, cancelBubble, cancelable, composed, defaultPrevented, eventPhase, gamma, returnValue, timeStamp, type })
// }

export { setupReceiver, setupTransceiver }
