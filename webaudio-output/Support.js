export async function requestPermission(ws1) {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    const response = await DeviceOrientationEvent.requestPermission()
    if (response === 'granted') {
      window.ondeviceorientation = (event) => {
        ws1.send(JSON.stringify({ type: 'ondeviceorientation', ws1Id: ws1.id, ws2Id: ws1.pair, event }))
      }
      window.ondeviceorientationabsolute = (event) => {
        ws1.send(JSON.stringify({ type: 'ondeviceorientationabsolute', ws1Id: ws1.id, ws2Id: ws1.pair, event }))
      }
      window.ondevicemotion = (event) => {
        ws1.send(JSON.stringify({ type: 'ondevicemotion', ws1Id: ws1.id, ws2Id: ws1.pair, event }))
      }
    }
  }
}

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

export function setSenderPriority(pc) {
  pc.getSenders().forEach((sender) => {
    if (sender.track.kind === 'video') {
      const params = sender.getParameters()
      if (params.encodings.length > 0) {
        console.log('params:', params)
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
    sender.transform = new RTCRtpScriptTransform(worker, {
      operation: 'encode',
      kind: sender.track.kind,
    })
  } else {
    const { readable, writable } = sender.createEncodedStreams()
    let options = { operation: 'encode', kind: sender.track.kind }
    worker.postMessage({ options, readable, writable }, [readable, writable])
  }
}

export function setupReceiverTransform(receiver) {
  if (window.RTCRtpScriptTransform) {
    receiver.transform = new RTCRtpScriptTransform(worker, {
      operation: 'decode',
      kind: receiver.track.kind,
    })
  } else {
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
