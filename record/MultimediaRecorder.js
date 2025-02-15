export const SupportedType = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=h264,opus',
  'video/webm;codecs=av01,opus',
  'video/x-matroska;codecs=hvc1.1.6.L186.B0,opus', // h265
  'video/mp4;codecs=vp9,mp4a.40.2',
  'video/mp4;codecs=vp9,opus',
  'video/mp4;codecs=avc1.64003E,mp4a.40.2',
  'video/mp4;codecs=avc1.64003E,opus',
  'video/mp4;codecs=avc3.64003E,mp4a.40.2',
  'video/mp4;codecs=avc3.64003E,opus',
  'video/mp4;codecs=hvc1.1.6.L186.B0,mp4a.40.2',
  'video/mp4;codecs=hvc1.1.6.L186.B0,opus',
  'video/mp4;codecs=hev1.1.6.L186.B0,mp4a.40.2',
  'video/mp4;codecs=hev1.1.6.L186.B0,opus',
  'video/mp4;codecs=av01.0.19M.08,mp4a.40.2',
  'video/mp4;codecs=av01.0.19M.08,opus',
  'video/mp4',
].filter((mimeType) => MediaRecorder.isTypeSupported(mimeType))

export class MultimediaRecorder {
  constructor() {
    this.mediaRecorder = null
    this.recordedBlobs = []
    this.mimeType = null
  }

  async start(stream, mimeType) {
    this.mimeType = mimeType
    this.recordedBlobs = []
    this.mediaRecorder = new MediaRecorder(stream, { mimeType })

    this.mediaRecorder.onstop = (event) => {
      console.log('Recorder stopped: ', event)
      console.log('Recorded Blobs: ', this.recordedBlobs)
    }

    this.mediaRecorder.ondataavailable = ({ data }) => {
      if (data && data.size > 0) {
        this.recordedBlobs.push(data)
      }
    }

    this.mediaRecorder.start()
  }

  stop() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
    }
  }

  play() {
    const superBuffer = new Blob(this.recordedBlobs, { type: this.mimeType })
    const recordedVideo = document.querySelector('video#recorded')
    recordedVideo.src = window.URL.createObjectURL(superBuffer)
    recordedVideo.controls = true
    recordedVideo.play()
  }

  download() {
    const blob = new Blob(this.recordedBlobs, { type: this.mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url

    switch (this.mimeType.split(';', 1)[0]) {
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
        throw new Error(`unsupported mimetype: ${this.mimeType}`)
    }
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 100)
  }
}
