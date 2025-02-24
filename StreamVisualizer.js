export class StreamVisualizer {
  constructor(remoteStream, canvas) {
    this.WIDTH = 720
    this.HEIGHT = 150
    // Interesting parameters to tweak!
    this.SMOOTHING = 0.8
    this.FFT_SIZE = 2048

    this.canvas = canvas
    this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'
    this.drawContext = this.canvas.getContext('2d')

    this.context = new (window.AudioContext || window.webkitAudioContext)()
    if (!this.context) {
      alert('Sorry! Web Audio is not supported by this browser')
      return
    }

    this.source = this.context.createMediaStreamSource(remoteStream)
    this.analyser = this.context.createAnalyser()
    this.analyser.minDecibels = -140
    this.analyser.maxDecibels = 0
    this.freqs = new Uint8Array(this.analyser.frequencyBinCount)
    this.times = new Uint8Array(this.analyser.frequencyBinCount)

    this.source.connect(this.analyser)

    this.startTime = 0
    this.startOffset = 0
  }

  start() {
    requestAnimationFrame(this.draw.bind(this))
  }

  draw() {
    let barWidth, offset, height, percent, value
    this.analyser.smoothingTimeConstant = this.SMOOTHING
    this.analyser.fftSize = this.FFT_SIZE

    this.analyser.getByteFrequencyData(this.freqs)
    this.analyser.getByteTimeDomainData(this.times)

    this.canvas.width = this.WIDTH
    this.canvas.height = this.HEIGHT
    this.drawContext.clearRect(0, 0, this.WIDTH, this.HEIGHT)

    // Draw the frequency domain chart.
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      value = this.freqs[i]
      percent = value / 256
      height = this.HEIGHT * percent
      offset = this.HEIGHT - height - 1
      barWidth = this.WIDTH / this.analyser.frequencyBinCount
      let hue = (i / this.analyser.frequencyBinCount) * 360
      this.drawContext.fillStyle = `rgb(${value + 50}, 50, 255)`
      this.drawContext.fillRect(i * barWidth, offset, barWidth, height)
    }

    // Draw the time domain chart.
    for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
      value = this.times[i]
      percent = value / 256
      height = this.HEIGHT * percent
      offset = this.HEIGHT - height - 1
      barWidth = this.WIDTH / this.analyser.frequencyBinCount
      this.drawContext.fillStyle = `rgb(125, 25, 150)`
      this.drawContext.fillRect(i * barWidth, offset, 1, 2)
    }

    requestAnimationFrame(this.draw.bind(this))
  }

  getFrequencyValue(freq) {
    let nyquist = this.context.sampleRate / 2
    let index = Math.round((freq / nyquist) * this.freqs.length)
    return this.freqs[index]
  }
}
