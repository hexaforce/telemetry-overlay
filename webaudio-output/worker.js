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
  controller.enqueue(decodedFrame)
}
// Dec Audio
const decodeAudio = (decodedFrame, controller) => {
  controller.enqueue(decodedFrame)
}

function handleTransform(options, readable, writable) {
  const { operation, kind } = options
  if (operation === 'encode') {
    let transform = kind === 'video' ? encodeVideo : encodeAudio
    readable.pipeThrough(new TransformStream({ transform })).pipeTo(writable)
  } else if (operation === 'decode') {
    let transform = kind === 'video' ? decodeVideo : decodeAudio
    readable.pipeThrough(new TransformStream({ transform })).pipeTo(writable)
  }
}

onmessage = ({ data }) => {
  const { options, readable, writable } = data
  handleTransform(options, readable, writable)
}

if (self.RTCTransformEvent) {
  self.onrtctransform = ({ transformer }) => {
    const { options, readable, writable } = transformer
    handleTransform(options, readable, writable)
  }
}
