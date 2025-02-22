'use strict'

const encodeCallback = (encodedFrame, controller) => {
  controller.enqueue(encodedFrame)
}
const decodeCallback = (encodedFrame, controller) => {
  controller.enqueue(encodedFrame)
}

function handleTransform(options, readable, writable) {
  const { operation, kind } = options
  if (operation === 'encode') {
    readable.pipeThrough(new TransformStream({ transform: encodeCallback })).pipeTo(writable)
  } else if (operation === 'decode') {
    readable.pipeThrough(new TransformStream({ transform: decodeCallback })).pipeTo(writable)
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
