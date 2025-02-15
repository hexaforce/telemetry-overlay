export class MultimediaRecorder {
  constructor() {
    this.mediaRecorder = null
    this.recordedBlobs = []
    this.mimeType = null
  }

  // 録画開始
  async startRecording(stream, mimeType) {
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

  // 録画停止
  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop()
    }
  }

  // 再生
  playRecording() {
    const superBuffer = new Blob(this.recordedBlobs, { type: this.mimeType })
    const recordedVideo = document.querySelector('video#recorded')
    recordedVideo.src = window.URL.createObjectURL(superBuffer)
    recordedVideo.controls = true
    recordedVideo.play()
  }

  // ダウンロード
  downloadRecording() {
    const blob = new Blob(this.recordedBlobs, { type: this.mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url

    switch (this.mimeType.split(';', 1)[0]) {
      case 'video/mp4':
        a.download = 'test.mp4'
        break
      case 'video/webm':
        a.download = 'test.webm'
        break
      case 'video/x-matroska':
        a.download = 'test.mkv'
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
