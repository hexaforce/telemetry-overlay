export class AudioVisualizer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.audioContext = null
    this.nodeAnalyzer = null
    this.FFT_SIZE = 1024
    this.SMOOTHING = 0.85

    this.resizeCanvas()
    window.addEventListener('resize', () => this.resizeCanvas())
  }

  async start(stream) {
    if (this.audioContext) return

    this.audioContext = new AudioContext()
    this.nodeAnalyzer = this.audioContext.createAnalyser()
    this.nodeAnalyzer.fftSize = this.FFT_SIZE
    this.nodeAnalyzer.smoothingTimeConstant = this.SMOOTHING

    const nodeSource = this.audioContext.createMediaStreamSource(stream)
    nodeSource.connect(this.nodeAnalyzer)

    this.loop()
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  draw() {
    if (!this.nodeAnalyzer) return

    const freqByteData = new Uint8Array(this.FFT_SIZE / 2)
    this.nodeAnalyzer.getByteFrequencyData(freqByteData)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    const barWidth = this.canvas.width / freqByteData.length
    const maxHeight = this.canvas.height * 0.9

    for (let i = 0; i < freqByteData.length; i++) {
      const value = freqByteData[i]
      const barHeight = (value / 256) * maxHeight
      const x = i * barWidth
      const y = this.canvas.height - barHeight

      this.ctx.fillStyle = `rgb(${value + 50}, 50, 255)`
      this.ctx.fillRect(x, y, barWidth - 1, barHeight)
    }
  }

  loop() {
    requestAnimationFrame(() => this.loop())
    this.draw()
  }
}
