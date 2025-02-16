navigator.mediaDevices.enumerateDevices().then((deviceArray) => {
  const videoSelect = document.querySelector('select#videoSource')
  const audioSelect = document.querySelector('select#audioSource')
  while (videoSelect.firstChild) videoSelect.removeChild(videoSelect.firstChild)
  while (audioSelect.firstChild) audioSelect.removeChild(audioSelect.firstChild)
  for (let i = 0; i < deviceArray.length; i++) {
    const option = document.createElement('option')
    option.value = deviceId
    const { deviceId, kind, label } = deviceArray[i]
    if (kind === 'videoinput') {
      option.text = label || `Camera ${videoSelect.length + 1}`
      videoSelect.appendChild(option)
    } else if (kind === 'audioinput') {
      option.text = label || `Microphone ${audioSelect.length + 1}`
      audioSelect.appendChild(option)
    }
  }
})

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
