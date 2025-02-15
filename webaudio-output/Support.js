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
    if (transceiver.receiver.track.kind === 'video') {
      const supportedCodecs = RTCRtpReceiver.getCapabilities('video').codecs
      const preferredOrder = ['video/H264', 'video/VP8', 'video/AV1', 'video/VP9', 'video/H265']
      transceiver.setCodecPreferences(sort(supportedCodecs, preferredOrder))
    }
    if (transceiver.receiver.track.kind === 'audio') {
      const supportedCodecs = RTCRtpReceiver.getCapabilities('audio').codecs
      const preferredOrder = ['audio/opus', 'audio/G722', 'audio/PCMU', 'audio/PCMA']
      transceiver.setCodecPreferences(sort(supportedCodecs, preferredOrder))
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
