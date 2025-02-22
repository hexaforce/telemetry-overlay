'use strict'

const encodeVideo = (encodedFrame, controller) => {
  controller.enqueue(encodedFrame)
}
const encodeAudio = (encodedFrame, controller) => {
  controller.enqueue(encodedFrame)
}
const decodeVideo = (decodedFrame, controller) => {
  controller.enqueue(decodedFrame)
}
const decodeAudio = (decodedFrame, controller) => {
  controller.enqueue(decodedFrame)
}

function handleTransform(options, readable, writable) {
  const { operation, kind } = options
  if (operation === 'encode') {
    if (kind === 'video') {
      readable.pipeThrough(new TransformStream({ transform: encodeVideo })).pipeTo(writable)
    } else if (kind === 'audio') {
      readable.pipeThrough(new TransformStream({ transform: encodeAudio })).pipeTo(writable)
    }
  } else if (operation === 'decode') {
    if (kind === 'video') {
      readable.pipeThrough(new TransformStream({ transform: decodeVideo })).pipeTo(writable)
    } else if (kind === 'audio') {
      readable.pipeThrough(new TransformStream({ transform: decodeAudio })).pipeTo(writable)
    }
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
