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

const preferredOrderAudio = ['audio/opus', 'audio/G722', 'audio/PCMU', 'audio/PCMA']
const preferredOrderVideo = ['video/H264', 'video/VP9', 'video/AV1', 'video/VP8', 'video/H265']

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

// --- Codec --------------------------

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
