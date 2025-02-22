'use strict'

const encodeCallback = (encodedFrame, controller) => {
  controller.enqueue(encodedFrame)
}
const decodeCallback = (encodedFrame, controller) => {
  controller.enqueue(encodedFrame)
}

function handleTransform(operation, readable, writable) {
  if (operation === 'encode') {
    readable.pipeThrough(new TransformStream({ transform: encodeCallback })).pipeTo(writable)
  } else if (operation === 'decode') {
    readable.pipeThrough(new TransformStream({ transform: decodeCallback })).pipeTo(writable)
  }
}

onmessage = ({ data }) => {
  const { operation, readable, writable } = data
  if (operation === 'encode' || operation === 'decode') {
    return handleTransform(operation, readable, writable)
  }
}

if (self.RTCTransformEvent) {
  self.onrtctransform = ({ transformer }) => {
    const { options, readable, writable } = transformer
    handleTransform(options.operation, readable, writable)
  }
}
