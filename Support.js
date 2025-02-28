// Transceiver List
// --------------------------------------------------------------------------------------------
export function changeTransceiverEntries(transceivers, entries) {
  initButton.disabled = entries.length === 0
  while (transceivers.firstChild) transceivers.removeChild(transceivers.firstChild)
  entries.forEach((value) => {
    const option = document.createElement('option')
    option.value = value
    option.innerText = value
    transceivers.appendChild(option)
  })
}

// Transceiver camera and microphone list
// --------------------------------------------------------------------------------------------
export async function getDevices() {
  let stream = null
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    return await navigator.mediaDevices.enumerateDevices()
  } catch (error) {
    return error
  } finally {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }
  }
}

export function updateDeviceList(videoSelect, audioSelect, devices) {
  while (videoSelect.firstChild) videoSelect.removeChild(videoSelect.firstChild)
  while (audioSelect.firstChild) audioSelect.removeChild(audioSelect.firstChild)
  devices.forEach(({ deviceId, kind, label }) => {
    const option = document.createElement('option')
    option.value = deviceId
    if (kind === 'videoinput') {
      option.text = label || `Camera ${videoSelect.length + 1}`
      videoSelect.appendChild(option)
    } else if (kind === 'audioinput') {
      option.text = label || `Microphone ${audioSelect.length + 1}`
      audioSelect.appendChild(option)
    }
  })
}

// Transceiver network priority
// --------------------------------------------------------------------------------------------
export function setSenderPriority(pc) {
  pc.getSenders().forEach((sender) => {
    if (sender.track.kind === 'video') {
      const params = sender.getParameters()
      if (params.encodings.length > 0) {
        params.encodings[0].priority = 'high'
        params.encodings[0].networkPriority = 'high'
        params.encodings[0].maxBitrate = 10 * 1000 * 1000
      }
      sender.setParameters(params).catch((err) => console.warn('setParameters failed:', err))
    }
  })
}

// Hooks encoding and decoding
// --------------------------------------------------------------------------------------------
const worker = new Worker('./Transform.js', { name: 'Encode/Decode worker' })

export function setupSenderTransform(sender) {
  if (window.RTCRtpScriptTransform) {
    // Safari,Firefox
    sender.transform = new RTCRtpScriptTransform(worker, {
      operation: 'encode',
      kind: sender.track.kind,
    })
  } else {
    // Chrome
    const { readable, writable } = sender.createEncodedStreams()
    let options = { operation: 'encode', kind: sender.track.kind }
    worker.postMessage({ options, readable, writable }, [readable, writable])
  }
}

export function setupReceiverTransform(receiver) {
  if (window.RTCRtpScriptTransform) {
    // Safari,Firefox
    receiver.transform = new RTCRtpScriptTransform(worker, {
      operation: 'decode',
      kind: receiver.track.kind,
    })
  } else {
    // Chrome
    const { readable, writable } = receiver.createEncodedStreams()
    let options = { operation: 'decode', kind: receiver.track.kind }
    worker.postMessage({ options, readable, writable }, [readable, writable])
  }
}

// In the case of iOS, permission is obtained through user operation
// --------------------------------------------------------------------------------------------
export async function requestPermission() {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    let permissionState = await DeviceMotionEvent.requestPermission()
    if (permissionState === 'granted') {
      console.log('Motion permission granted!')
    } else {
      console.log('Motion permission denied.')
    }
  }
}

const preferredOrderAudio = ['audio/opus', 'audio/G722', 'audio/PCMU', 'audio/PCMA']
const preferredOrderVideo = ['video/H264', 'video/VP9', 'video/AV1', 'video/VP8', 'video/H265']

// Change the codec priority
// --------------------------------------------------------------------------------------------
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

// Fix the codec to H264
// --------------------------------------------------------------------------------------------
// 42001f	Baseline Profile
// 42e01f	Constrained Baseline Profile
// 4d001f	Main Profile
// f4001f	High Profile
// 64001f	High Profile (Level 3.1)
export function fixedCodecH264(transceivers, profileLevelId = '42001f', packetizationMode = '1') {
  transceivers.forEach((transceiver) => {
    const kind = transceiver.receiver.track.kind
    const codecs = RTCRtpReceiver.getCapabilities(kind).codecs
    // const codecs = RTCRtpSender.getCapabilities(kind).codecs
    let filteredCodecs
    if (kind === 'video') {
      filteredCodecs = codecs.filter(
        (codec) =>
          codec.mimeType === 'video/H264' && //
          codec.sdpFmtpLine.includes(`profile-level-id=${profileLevelId}`) && //
          codec.sdpFmtpLine.includes(`packetization-mode=${packetizationMode}`), //
      )
    } else if (kind === 'audio') {
      filteredCodecs = codecs.filter((codec) => codec.mimeType === 'audio/opus')
    }
    transceiver.setCodecPreferences(filteredCodecs)
  })
}

export function isIPv4(address) {
  return /^((25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/.test(address)
}

export function toICE(candidate) {
  return candidate.match(/candidate:\d+ \d+ (udp|tcp) \d+ ([0-9.:a-fA-F]+) (\d+) typ (\w+)/)
}

export function isIOS() {
  return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1)
}
