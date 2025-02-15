export class MultimediaRecorder {
  mediaRecorder
  recordedBlobs

  constructor(mimeType) {
    this.recordedBlobs = []
    this.initializeRecorder(mimeType)
  }

  async initializeRecorder(mimeType) {
    // const mimeType = codecPreferences.options[codecPreferences.selectedIndex].value
    if (mimeType.split(';', 1)[0] === 'video/mp4') {
      // Adjust sampling rate to 48khz.
      const track = window.stream.getAudioTracks()[0]
      if (track) {
        const { sampleRate } = track.getSettings()
        if (sampleRate !== 48000) {
          track.stop()
          window.stream.removeTrack(track)
          const newStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 48000 } })
          window.stream.addTrack(newStream.getTracks()[0])
        }
      }
    }
    this.mediaRecorder = new MediaRecorder(window.stream, { mimeType })
    this.mediaRecorder.onstop = (event) => {
      // console.log('Recorder stopped: ', event)
      // console.log('Recorded Blobs: ', this.recordedBlobs)
    }
    this.mediaRecorder.ondataavailable = ({ data }) => {
        console.log("===============")
      if (data && data.size > 0) {
        console.log("--------------")
        this.recordedBlobs.push(data)
      }
    }
    console.log("------start--------",mimeType)
    this.mediaRecorder.start()
  }

  // play
  //----------------------
  play(mimeType, recordedVideo) {
    console.log(mimeType)
    console.log(recordedVideo)
    const superBuffer = new Blob(this.recordedBlobs, { type: mimeType })
    recordedVideo.src = null
    recordedVideo.srcObject = null
    recordedVideo.src = window.URL.createObjectURL(superBuffer)
    recordedVideo.controls = true
    recordedVideo.play()
  }

  // download
  //----------------------
  download(mimeType) {
    console.log(mimeType)
    const blob = new Blob(this.recordedBlobs, { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    switch (mimeType) {
      case 'video/mp4':
        a.download = `test.mp4`
        break
      case 'video/webm':
        a.download = `test.webm`
        break
      case 'video/x-matroska':
        a.download = `test.mkv`
        break
      default:
        throw new Error(`unsupported mimetype: ${mimeType}`)
    }
    document.body.appendChild(a)
    a.click()
    // setTimeout(() => {
    //   document.body.removeChild(a)
    //   window.URL.revokeObjectURL(url)
    // }, 100)
  }

  clear(){

  }

  // stop
  //----------------------
  stop(){
    this.mediaRecorder.stop()
  }

}
