'use strict'

// Enc Video
const encodeVideo = (encodedFrame, controller) => {
  controller.enqueue(encodedFrame)
}
// Enc Audio
const encodeAudio = (encodedFrame, controller) => {
  controller.enqueue(encodedFrame)
}
// Dec Video
const decodeVideo = (decodedFrame, controller) => {
  if (decodedFrame.type === 'key') {
    console.log('Metadata:', decodedFrame.getMetadata())
  }
  // console.log(decodedFrame.data.byteLength)
  controller.enqueue(decodedFrame)
}
// Dec Audio
const decodeAudio = (decodedFrame, controller) => {
  controller.enqueue(decodedFrame)
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
