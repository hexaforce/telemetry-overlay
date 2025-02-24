'use strict'

// Encoded Video
const encodeVideo = (chunk, controller) => {
  controller.enqueue(chunk)
}
// Encoded Audio
const encodeAudio = (chunk, controller) => {
  controller.enqueue(chunk)
}
// Decoded Video
const decodeVideo = (chunk, controller) => {
  if (chunk.type === 'key') {
    const { width, height, mimeType, payloadType } = chunk.getMetadata()
    console.log(`Keyframe detection resolution:${width}x${height} codec:${mimeType} payload:${payloadType} size:${chunk.data.byteLength}`)
  }
  controller.enqueue(chunk)
}
// Decoded Audio
const decodeAudio = (chunk, controller) => {
  controller.enqueue(chunk)
}

function handleTransform(dataTransformer) {
  const { options, readable, writable } = dataTransformer
  const { operation, kind } = options
  if (operation === 'encode') {
    let transform = kind === 'video' ? encodeVideo : encodeAudio
    readable.pipeThrough(new TransformStream({ transform })).pipeTo(writable)
  } else if (operation === 'decode') {
    let transform = kind === 'video' ? decodeVideo : decodeAudio
    readable.pipeThrough(new TransformStream({ transform })).pipeTo(writable)
  }
}

// Chrome
onmessage = ({ data }) => handleTransform(data)

// Safari,Firefox
if (self.RTCTransformEvent) {
  self.onrtctransform = ({ transformer }) => handleTransform(transformer)
}
