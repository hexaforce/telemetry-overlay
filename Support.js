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

export function isIPv4(address) {
  return /^((25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/.test(address)
}

export function toICE(candidate) {
  return candidate.match(/candidate:\d+ \d+ (udp|tcp) \d+ ([0-9.:a-fA-F]+) (\d+) typ (\w+)/)
}

export function isIOS() {
  return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1)
}

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
