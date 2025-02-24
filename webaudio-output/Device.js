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

function loadProperties(refreshValuesOnly) {
  const track = window.track
  const capabilities = track.getCapabilities()
  const settings = track.getSettings()
  console.log('Capabilities: ', capabilities)
  console.log('Settings: ', settings)

  for (const property of ['exposureMode', 'exposureTime', 'exposureCompensation', 'brightness', 'whiteBalanceMode']) {
    // Check whether camera supports exposure.
    if (!(property in settings)) {
      errorMsg(`Camera does not support ${property}.`)
      continue
    }

    let element

    if (Array.isArray(capabilities[property])) {
      // Map it to a select element.
      const select = document.querySelector(`select[name=${property}]`)
      element = select
      if (capabilities[property] && !refreshValuesOnly) {
        for (const mode of capabilities[property]) {
          select.insertAdjacentHTML('afterbegin', `<option value="${mode}">${mode}</option>`)
        }
      }
    } else {
      // Map it to a slider element.
      const input = document.querySelector(`input[name=${property}]`)
      element = input
      input.min = capabilities[property].min
      input.max = capabilities[property].max
      input.step = capabilities[property].step
    }

    element.value = settings[property]
    element.disabled = false
    if (!refreshValuesOnly) {
      element.oninput = async (event) => {
        try {
          const constraints = { advanced: [{ [property]: element.value }] }
          await track.applyConstraints(constraints)
          console.log('Did successfully apply new constraints: ', constraints)
          console.log('New camera settings: ', track.getSettings())
        } catch (err) {
          console.error('applyConstraints() failed: ', err)
        }
      }
    }
  }
}

function handleSuccess(stream) {
  const video = document.querySelector('video')
  const videoTracks = stream.getVideoTracks()
  console.log('Got stream with constraints:', constraints)
  console.log(`Using video device: ${videoTracks[0].label}`)
  video.srcObject = stream

  // make track variable available to browser console.
  const [track] = ([window.track] = stream.getVideoTracks())
  const capabilities = track.getCapabilities()
  const settings = track.getSettings()

  for (const ptz of ['pan', 'tilt', 'zoom']) {
    // Check whether camera supports pan/tilt/zoom.
    if (!(ptz in settings)) {
      errorMsg(`Camera does not support ${ptz}.`)
      continue
    }

    // Map it to a slider element.
    const input = document.querySelector(`input[name=${ptz}]`)
    input.min = capabilities[ptz].min
    input.max = capabilities[ptz].max
    input.step = capabilities[ptz].step
    input.value = settings[ptz]
    input.disabled = false
    input.oninput = async (event) => {
      try {
        const constraints = { advanced: [{ [ptz]: input.value }] }
        await track.applyConstraints(constraints)
      } catch (err) {
        console.error('applyConstraints() failed: ', err)
      }
    }
  }
}