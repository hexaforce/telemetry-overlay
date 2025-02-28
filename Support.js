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

// Visualize audio stream
// --------------------------------------------------------------------------------------------
export class AudioStreamVisualizer {
  constructor(remoteStream, canvas) {
    this.WIDTH = 720
    this.HEIGHT = 150
    // Interesting parameters to tweak!
    this.SMOOTHING = 0.8
    this.FFT_SIZE = 2048

    this.canvas = canvas
    this.drawContext = this.canvas.getContext('2d')

    this.context = new (window.AudioContext || window.webkitAudioContext)()
    if (!this.context) {
      console.log('Sorry! Web Audio is not supported by this browser')
      return
    }

    this.source = this.context.createMediaStreamSource(remoteStream)
    this.analyser = this.context.createAnalyser()
    this.analyser.minDecibels = -140
    this.analyser.maxDecibels = 0
    this.freqs = new Uint8Array(this.analyser.frequencyBinCount)
    this.times = new Uint8Array(this.analyser.frequencyBinCount)

    this.source.connect(this.analyser)

    this.startTime = 0
    this.startOffset = 0
  }

  start() {
    requestAnimationFrame(this.draw.bind(this))
  }

  draw() {
    let barWidth, offset, height, percent, value
    this.analyser.smoothingTimeConstant = this.SMOOTHING
    this.analyser.fftSize = this.FFT_SIZE

    this.analyser.getByteFrequencyData(this.freqs)
    this.analyser.getByteTimeDomainData(this.times)

    this.canvas.width = this.WIDTH
    this.canvas.height = this.HEIGHT
    this.drawContext.clearRect(0, 0, this.WIDTH, this.HEIGHT)

    // Draw the frequency domain chart.
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      value = this.freqs[i]
      percent = value / 256
      height = this.HEIGHT * percent
      offset = this.HEIGHT - height - 1
      barWidth = this.WIDTH / this.analyser.frequencyBinCount
      let hue = (i / this.analyser.frequencyBinCount) * 360
      this.drawContext.fillStyle = `rgb(${value + 50}, 50, 255)`
      this.drawContext.fillRect(i * barWidth, offset, barWidth, height)
    }

    // Draw the time domain chart.
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      value = this.times[i]
      percent = value / 256
      height = this.HEIGHT * percent
      offset = this.HEIGHT - height - 1
      barWidth = this.WIDTH / this.analyser.frequencyBinCount
      this.drawContext.fillStyle = `rgb(125, 25, 150)`
      this.drawContext.fillRect(i * barWidth, offset, 1, 2)
    }

    requestAnimationFrame(this.draw.bind(this))
  }

  getFrequencyValue(freq) {
    let nyquist = this.context.sampleRate / 2
    let index = Math.round((freq / nyquist) * this.freqs.length)
    return this.freqs[index]
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

// Prints information about RTCPeerConnection
// --------------------------------------------------------------------------------------------
export function reportAggregate(stats, remoteCandidateAddress, localCandidateAddress) {
  function resolveIds(report1, idNames) {
    idNames.forEach((idName) => {
      if (idName.endsWith('Id') && typeof report1[idName] === 'string' && stats.has(report1[idName])) {
        let report2 = { ...stats.get(report1[idName]) }
        delete report2.id
        delete report2.type
        delete report2.timestamp
        if (idName === 'localCandidateId') report2.address = localCandidateAddress[report2.port]
        if (idName === 'remoteCandidateId') report2.address = remoteCandidateAddress[report2.port]
        report1[idName.slice(0, -2)] = report2
        delete report1[idName]
      }
    })
  }

  let result = []

  stats.forEach((report) => {
    const { type } = report
    if (type === 'candidate-pair') {
      if (report.nominated) {
        let report0 = { ...report }
        delete report0.id
        delete report0.timestamp
        resolveIds(report0, ['localCandidateId', 'remoteCandidateId'])
        result.push(report0)
      }
    }
    if (type === 'inbound-rtp') {
      let report0 = { ...report }
      delete report0.id
      delete report0.timestamp
      resolveIds(report0, ['codecId', 'remoteId'])
      result.push(report0)
    }
  })

  return result
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
