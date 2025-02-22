export const SupportedType = [
  { label: 'H.264 (AVC1) + AAC', value: 'video/mp4;codecs=avc1.64003E,mp4a.40.2' },
  { label: 'H.264 (AVC1) + Opus', value: 'video/mp4;codecs=avc1.64003E,opus' },
  { label: 'H.264 (AVC3) + AAC', value: 'video/mp4;codecs=avc3.64003E,mp4a.40.2' },
  { label: 'H.264 (AVC3) + Opus', value: 'video/mp4;codecs=avc3.64003E,opus' },
  { label: 'H.265 (HVC) + AAC', value: 'video/mp4;codecs=hvc1.1.6.L186.B0,mp4a.40.2' },
  { label: 'H.265 (HVC) + Opus', value: 'video/mp4;codecs=hvc1.1.6.L186.B0,opus' },
  { label: 'H.265 (HEV) + AAC', value: 'video/mp4;codecs=hev1.1.6.L186.B0,mp4a.40.2' },
  { label: 'H.265 (HEV) + Opus', value: 'video/mp4;codecs=hev1.1.6.L186.B0,opus' },
  { label: 'VP9 + AAC', value: 'video/mp4;codecs=vp9,mp4a.40.2' },
  { label: 'VP9 + Opus', value: 'video/mp4;codecs=vp9,opus' },
  { label: 'AV1 (AOMediaVideo1) + Opus', value: 'video/mp4;codecs=av01.0.19M.08,opus' },
  { label: 'AV1 (AOMediaVideo1) + AAC', value: 'video/mp4;codecs=av01.0.19M.08,mp4a.40.2' },
  { label: 'MP4 (Generic)', value: 'video/mp4' },
  { label: 'WebM + H.264 + Opus', value: 'video/webm;codecs=h264,opus' },
  { label: 'WebM + VP8 + Opus', value: 'video/webm;codecs=vp8,opus' },
  { label: 'WebM + VP9 + Opus', value: 'video/webm;codecs=vp9,opus' },
  { label: 'WebM + AV1 + Opus', value: 'video/webm;codecs=av01,opus' },
  { label: 'Matroska + H.265 (HVC) + Opus', value: 'video/x-matroska;codecs=hvc1.1.6.L186.B0,opus' },
  { label: 'Matroska + H.265 (HEV) + Opus', value: 'video/x-matroska;codecs=hev1.1.6.L186.B0,opus' },
].filter((mimeType) => MediaRecorder.isTypeSupported(mimeType.value))

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
    const recordedVideo = document.querySelector('video#recordedPlay')
    recordedVideo.src = window.URL.createObjectURL(superBuffer)
    recordedVideo.controls = true
    recordedVideo.play()
  }

  download(download) {
    const blob = new Blob(this.recordedBlobs, { type: this.mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = download
    if (this.mimeType.startsWith('video/mp4')) {
      a.download += '.mp4'
    } else if (this.mimeType.startsWith('video/webm')) {
      a.download += '.webm'
    } else if (this.mimeType.startsWith('video/x-matroska')) {
      a.download += '.mkv'
    }
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 100)
  }
}
