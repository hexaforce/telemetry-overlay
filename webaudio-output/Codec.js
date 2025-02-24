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
    // const codecs = RTCRtpSender.getCapabilities(kind).codecs
    let filteredCodecs
    if (kind === 'video') {
      filteredCodecs = codecs.filter((codec) => codec.mimeType === 'video/H264' && codec.sdpFmtpLine.includes(`profile-level-id=${profileLevelId}`) && codec.sdpFmtpLine.includes(`packetization-mode=${packetizationMode}`))
    } else if (kind === 'audio') {
      filteredCodecs = codecs.filter((codec) => codec.mimeType === 'audio/opus')
    }
    transceiver.setCodecPreferences(filteredCodecs)
  })
}
