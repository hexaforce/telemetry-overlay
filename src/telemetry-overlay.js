class HudConstants {
  static STYLE = {
    lineWidth: 1,
    color: 'rgba(0, 255, 0, 1)',
    font: '18px monospace',
    thickLineWidth: 2,
    thinLineWidth: 1,
  }
}

// Renderer(TelemetryOverlay)
// --------------------------------------------------------------------------------------------
class Renderer {
  constructor(canvas, style) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.style = style
    this.center = { x: canvas.width / 2, y: canvas.height / 2 }
    this.currentDisplayAltitude = 0
    this.currentDisplaySpeed = 0
  }

  updateCanvas() {
    const dpr = window.devicePixelRatio || 1
    const logicalWidth = window.innerWidth
    const logicalHeight = window.innerHeight

    this.canvas.width = logicalWidth * dpr
    this.canvas.height = logicalHeight * dpr
    this.canvas.style.width = `${logicalWidth}px`
    this.canvas.style.height = `${logicalHeight}px`

    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.scale(dpr, dpr)

    this.center = {
      x: logicalWidth / 2,
      y: logicalHeight / 2,
    }

    this.width = logicalWidth
    this.height = logicalHeight
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  positionSize(component) {
    switch (component) {
      case 'Compass': {
        this.ctx.font = `900 ${this.style.font}`
        this.ctx.fillStyle = this.style.color
        this.ctx.strokeStyle = this.style.color
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'bottom'
        const width = this.width / 2.5
        const height = this.height / 12
        const center = { x: this.center.x, y: this.center.y / 10 }
        const x = center.x - width / 2
        const y = center.y - height / 2
        return { x, y, center, width, height }
      }
      case 'Crosshair': {
        this.ctx.strokeStyle = this.style.color
        this.ctx.lineWidth = this.style.thickLineWidth
        const width = this.width / 8
        const height = width
        const center = { x: this.center.x, y: this.center.y }
        const x = center.x - width / 2
        const y = center.y - height / 2
        return { x, y, center, width, height }
      }
      case 'PitchLadder': {
        this.ctx.strokeStyle = this.style.color
        this.ctx.fillStyle = this.style.color
        this.ctx.font = this.style.font
        this.ctx.textAlign = 'center'
        this.ctx.textBaseline = 'middle'
        const width = this.width / 3.5
        const height = this.height / 1.3
        const center = { x: this.center.x, y: this.center.y }
        const x = center.x - width / 2
        const y = center.y - height / 2
        return { x, y, center, width, height }
      }
      case 'RollIndicator': {
        this.ctx.strokeStyle = this.style.color
        this.ctx.lineWidth = this.style.thinLineWidth
        const width = this.width / 10
        const height = width
        const center = { x: this.center.x, y: this.center.y }
        const x = center.x - width / 2
        const y = center.y - height / 2
        return { x, y, center, width, height }
      }
      case 'Altitude': {
        this.ctx.strokeStyle = this.style.color
        this.ctx.fillStyle = this.style.color
        this.ctx.font = this.style.font
        this.ctx.textAlign = 'right'
        this.ctx.textBaseline = 'middle'
        const width = this.width / 22
        const height = this.height / 1.75
        const center = { x: (this.center.x + this.width) / 2, y: this.center.y }
        const x = center.x - width / 2
        const y = center.y - height / 2
        return { x, y, center, width, height }
      }
      case 'Speed': {
        this.ctx.strokeStyle = this.style.color
        this.ctx.fillStyle = this.style.color
        this.ctx.font = this.style.font
        this.ctx.textAlign = 'left'
        this.ctx.textBaseline = 'middle'
        const width = this.width / 22
        const height = this.height / 1.75
        const center = { x: this.center.x / 2, y: this.center.y }
        const x = center.x - width / 2
        const y = center.y - height / 2
        return { x, y, center, width, height }
      }
      case 'Battery': {
        const width = this.width / 30
        const height = this.height / 30
        const center = { x: this.width - width, y: height * 1.3 }
        const x = center.x - width / 2
        const y = center.y - height / 2
        return { x, y, center, width, height }
      }
    }
  }
}

// Compass(TelemetryOverlay)
// --------------------------------------------------------------------------------------------
class Compass {
  constructor(renderer) {
    this.renderer = renderer
    this.ctx = renderer.ctx
  }

  draw(heading) {
    const { ctx, canvas, style } = this.renderer
    const { center, width } = this.renderer.positionSize('Compass')

    ctx.save()
    try {
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
      const tickWidth = width / 8
      const smallTickWidth = width / 24

      const stepSize = width / 360
      const offset = (-stepSize * heading) % width

      const visibleRange = width / 2
      const startIndex = Math.floor((-offset - visibleRange) / tickWidth)
      const endIndex = Math.ceil((-offset + visibleRange) / tickWidth)

      for (let i = startIndex; i <= endIndex; i++) {
        const x = center.x + offset + i * tickWidth
        const dirIndex = ((i % directions.length) + directions.length) % directions.length

        if (x > -tickWidth && x < canvas.width + tickWidth) {
          ctx.fillText(directions[dirIndex], x, center.y + 20)

          ctx.beginPath()
          ctx.lineWidth = style.thickLineWidth * 1.25
          ctx.moveTo(x, center.y + 38)
          ctx.lineTo(x, center.y + 25)
          ctx.stroke()

          ctx.beginPath()
          ctx.lineWidth = style.thinLineWidth
          for (let j = 1; j <= 2; j++) {
            const smallRight = x + j * smallTickWidth
            if (0 < smallRight && smallRight < canvas.width) {
              ctx.moveTo(smallRight, center.y + 35)
              ctx.lineTo(smallRight, center.y + 25)
            }
            const smallLeft = x - j * smallTickWidth
            if (0 < smallLeft && smallLeft < canvas.width) {
              ctx.moveTo(smallLeft, center.y + 35)
              ctx.lineTo(smallLeft, center.y + 25)
            }
          }
          ctx.stroke()
        }
      }

      ctx.beginPath()
      ctx.moveTo(center.x, center.y + 40)
      ctx.lineTo(center.x - 7, center.y + 55)
      ctx.lineTo(center.x + 7, center.y + 55)
      ctx.closePath()
      ctx.fillStyle = 'red'
      ctx.fill()
    } finally {
      ctx.restore()
    }
  }
}

// Crosshair(TelemetryOverlay)
// --------------------------------------------------------------------------------------------
class Crosshair {
  constructor(renderer) {
    this.renderer = renderer
    this.ctx = renderer.ctx
  }

  draw() {
    const { ctx, style } = this.renderer
    const { center, width } = this.renderer.positionSize('Crosshair')

    ctx.save()
    try {
      const squareSize = width / 4
      const lineLength = width

      ctx.beginPath()
      ctx.rect(center.x - squareSize / 2, center.y - squareSize / 2, squareSize, squareSize)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(center.x - squareSize / 2 - lineLength, center.y)
      ctx.lineTo(center.x - squareSize / 2, center.y)
      ctx.moveTo(center.x + squareSize / 2, center.y)
      ctx.lineTo(center.x + squareSize / 2 + lineLength, center.y)
      ctx.moveTo(center.x, center.y - squareSize / 2 - lineLength)
      ctx.lineTo(center.x, center.y - squareSize / 2)
      ctx.moveTo(center.x, center.y + squareSize / 2)
      ctx.lineTo(center.x, center.y + squareSize / 2 + lineLength)
      ctx.stroke()
    } finally {
      ctx.restore()
    }
  }
}

// PitchLadder(TelemetryOverlay)
// --------------------------------------------------------------------------------------------
class PitchLadder {
  constructor(renderer) {
    this.renderer = renderer
    this.ctx = renderer.ctx
  }

  draw(pitch, roll) {
    const { ctx, style } = this.renderer
    const { center, width, height } = this.renderer.positionSize('PitchLadder')

    ctx.save()
    try {
      ctx.translate(center.x, center.y)
      ctx.rotate((roll * Math.PI) / 180)

      const degreeStep = 15
      const majorLineStep = 30
      const pixelPerDegree = height / 100
      const visibleRange = 45
      const centerPitch = Math.round(pitch / degreeStep) * degreeStep
      const startAngle = Math.max(centerPitch - visibleRange, -180)
      const endAngle = Math.min(centerPitch + visibleRange, 180)
      const centerOffset = (pitch - centerPitch) * pixelPerDegree

      for (let angle = startAngle; angle <= endAngle; angle += degreeStep) {
        const yPos = (angle - centerPitch) * pixelPerDegree - centerOffset

        if (Math.abs(yPos) > center.y + 100) continue

        const isMajorLine = angle % majorLineStep === 0
        ctx.lineWidth = isMajorLine ? style.thickLineWidth : style.thinLineWidth

        const lineLength = width / 2
        ctx.beginPath()
        ctx.moveTo(-lineLength, yPos)
        ctx.lineTo(lineLength, yPos)
        ctx.stroke()

        if (angle % degreeStep === 0 && angle !== 0) {
          const text = Math.abs(angle % 360).toString()
          const textWidth = ctx.measureText(text).width
          const textPos = width / 3

          ctx.textAlign = 'right'
          ctx.save()
          ctx.globalCompositeOperation = 'destination-out'
          ctx.fillRect(-textPos - textWidth - 4, yPos - 12, textWidth + 8, 24)
          ctx.restore()
          ctx.fillText(text, -textPos, yPos)

          ctx.textAlign = 'left'
          ctx.save()
          ctx.globalCompositeOperation = 'destination-out'
          ctx.fillRect(textPos - 4, yPos - 12, textWidth + 8, 24)
          ctx.restore()
          ctx.fillText(text, textPos, yPos)
        }
      }
    } finally {
      ctx.restore()
    }
  }
}

// RollIndicator(TelemetryOverlay)
// --------------------------------------------------------------------------------------------
class RollIndicator {
  constructor(renderer) {
    this.renderer = renderer
    this.ctx = renderer.ctx
  }

  draw(roll) {
    const { ctx, style } = this.renderer
    const { center, width, height } = this.renderer.positionSize('RollIndicator')
    const radius = width

    ctx.save()
    try {
      ctx.translate(center.x, center.y)

      ctx.beginPath()
      ctx.arc(0, 0, radius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.rotate((roll * Math.PI) / 180)
      ctx.beginPath()
      ctx.moveTo(0, -radius)
      ctx.lineTo(-7, -radius + 14)
      ctx.lineTo(7, -radius + 14)
      ctx.closePath()
      ctx.fillStyle = style.color
      ctx.fill()
    } finally {
      ctx.restore()
    }
  }
}

// Altitude(TelemetryOverlay)
// --------------------------------------------------------------------------------------------
class Altitude {
  constructor(renderer) {
    this.renderer = renderer
    this.ctx = renderer.ctx
  }

  draw(altitude = 0) {
    const { ctx, canvas, style } = this.renderer
    const { center, width, height } = this.renderer.positionSize('Altitude')

    const altitudeLerpFactor = 0.1
    this.renderer.currentDisplayAltitude += (altitude - this.renderer.currentDisplayAltitude) * altitudeLerpFactor

    ctx.save()
    try {
      const tapeWidth = width
      const tapeRight = canvas.width < 450 ? width - 20 : center.x + tapeWidth / 2
      const tapeLeft = tapeRight - tapeWidth

      ctx.translate(0.5, 0.5)

      const visibleRange = 15
      const altitudeStep = 1
      const centerAltitude = Math.round(this.renderer.currentDisplayAltitude / altitudeStep) * altitudeStep
      const altitudeMajorStep = 10

      ctx.beginPath()
      for (let alt = centerAltitude - visibleRange; alt <= centerAltitude + visibleRange; alt += altitudeStep) {
        if (alt < 0) continue

        const yPos = center.y - (alt - centerAltitude) * (height / 26)
        if (yPos < -50 || yPos > height * 2) continue

        const isMajorLine = alt % altitudeMajorStep === 0
        ctx.lineWidth = isMajorLine ? style.thickLineWidth : style.thinLineWidth

        ctx.moveTo(tapeRight - (isMajorLine ? tapeWidth * 0.9 : tapeWidth / 2), yPos)
        ctx.lineTo(tapeRight, yPos)

        if (isMajorLine) {
          ctx.fillText(alt.toString(), tapeLeft, yPos)
        }
      }
      ctx.stroke()

      const boxHeight = 30
      const boxY = center.y - boxHeight / 2
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

      ctx.strokeStyle = style.color
      ctx.lineWidth = style.thickLineWidth
      ctx.strokeRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

      ctx.fillStyle = style.color
      ctx.textAlign = 'left'
      ctx.fillText('ALT', tapeRight - tapeWidth, boxY - 15)

      ctx.font = 'bold 20px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(Math.round(this.renderer.currentDisplayAltitude).toString(), tapeRight - tapeWidth / 2, center.y)
    } finally {
      ctx.restore()
    }
  }
}

// Speed(TelemetryOverlay)
// --------------------------------------------------------------------------------------------
class Speed {
  constructor(renderer) {
    this.renderer = renderer
    this.ctx = renderer.ctx
  }

  draw(speed = 0) {
    const { ctx, canvas, style } = this.renderer
    const { center, width, height } = this.renderer.positionSize('Speed')

    const speedLerpFactor = 0.1
    this.renderer.currentDisplaySpeed += (speed - this.renderer.currentDisplaySpeed) * speedLerpFactor

    ctx.save()
    try {
      const tapeWidth = width
      const tapeRight = canvas.width < 450 ? width - 20 : center.x + tapeWidth / 2
      const tapeLeft = tapeRight - tapeWidth

      ctx.translate(0.5, 0.5)

      const visibleRange = 15
      const speedStep = 1
      const centerSpeed = Math.round(this.renderer.currentDisplaySpeed / speedStep) * speedStep
      const speedMajorStep = 10

      ctx.beginPath()
      for (let spd = centerSpeed - visibleRange; spd <= centerSpeed + visibleRange; spd += speedStep) {
        if (spd < 0) continue

        const yPos = center.y - (spd - centerSpeed) * (height / 26)
        if (yPos < -50 || yPos > height * 2) continue

        const isMajorLine = spd % speedMajorStep === 0
        const isFiveMultiple = spd % 5 === 0
        ctx.lineWidth = isMajorLine ? style.thickLineWidth : style.thinLineWidth

        ctx.moveTo(tapeLeft, yPos)
        ctx.lineTo(tapeLeft + (isMajorLine ? tapeWidth * 0.9 : tapeWidth / 2), yPos)

        if (isMajorLine || isFiveMultiple) {
          ctx.fillText(spd.toString(), tapeRight, yPos)
        }
      }
      ctx.stroke()

      const boxHeight = 30
      const boxY = center.y - boxHeight / 2
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

      ctx.strokeStyle = style.color
      ctx.lineWidth = style.thickLineWidth
      ctx.strokeRect(tapeLeft - 10, boxY, tapeWidth + 20, boxHeight)

      ctx.fillStyle = style.color
      ctx.textAlign = 'right'
      ctx.fillText('SPD', tapeRight, boxY - 15)

      ctx.font = 'bold 20px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(Math.round(this.renderer.currentDisplaySpeed).toString(), tapeLeft + tapeWidth / 2, center.y)
    } finally {
      ctx.restore()
    }
  }
}

// Battery(TelemetryOverlay)
// --------------------------------------------------------------------------------------------
class Battery {
  constructor(renderer) {
    this.renderer = renderer
    this.ctx = renderer.ctx
  }

  draw(level, charging) {
    const { ctx, style } = this.renderer
    const { x, y, center, width, height } = this.renderer.positionSize('Battery')

    const percentage = level * 100

    ctx.save()
    try {
      ctx.beginPath()
      ctx.roundRect(x, y, width, height, 5)
      ctx.fillStyle = 'rgba(0, 255, 0, 0.2)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.roundRect(x + width, y + (height - width / 2 / 2) / 2, width / 2 / 4, width / 2 / 2, 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'
      ctx.fill()

      const fillWidth = (width - 4) * (percentage / 100)
      ctx.beginPath()
      ctx.roundRect(x + 2, y + 2, fillWidth, height - 4, 4)

      const gradient = ctx.createLinearGradient(0, 0, fillWidth, 0)
      let colorStops
      let colors = {
        charging: ['rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)'],
        high: ['rgba(76, 175, 80, 0.9)', 'rgba(139, 195, 74, 0.9)'],
        medium: ['rgba(255, 193, 7, 0.9)', 'rgba(255, 235, 59, 0.9)'],
        low: ['rgba(244, 67, 54, 0.9)', 'rgba(255, 152, 0, 0.9)'],
      }

      if (charging) {
        colorStops = colors.charging
      } else if (percentage > 30) {
        colorStops = colors.high
      } else if (percentage > 10) {
        colorStops = colors.medium
      } else {
        colorStops = colors.low
      }

      gradient.addColorStop(0, colorStops[0])
      gradient.addColorStop(1, colorStops[1])
      ctx.fillStyle = gradient
      ctx.fill()

      if (charging) {
        ctx.fillStyle = 'rgba(250, 250, 0, 1)'
        ctx.beginPath()
        ctx.moveTo(center.x + 7, center.y - 15)
        ctx.lineTo(center.x - 10, center.y + 2)
        ctx.lineTo(center.x - 1, center.y + 2)
        ctx.lineTo(center.x - 7, center.y + 15)
        ctx.lineTo(center.x + 10, center.y - 2)
        ctx.lineTo(center.x + 1, center.y - 2)
        ctx.closePath()
        ctx.fill()
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 1)'
        ctx.font = 'bold 12px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.fillText(`${percentage}%`, x + width / 2, y + height / 2 + 5)
      }
    } finally {
      ctx.restore()
    }
  }
}

// TelemetryOverlay
// --------------------------------------------------------------------------------------------
export default class TelemetryOverlay {
  constructor(canvas) {
    this.renderer = new Renderer(canvas, HudConstants.STYLE)
    this.renderer.updateCanvas()

    this.components = {
      compass: new Compass(this.renderer),
      crosshair: new Crosshair(this.renderer),
      pitchLadder: new PitchLadder(this.renderer),
      rollIndicator: new RollIndicator(this.renderer),
      altitude: new Altitude(this.renderer),
      speed: new Speed(this.renderer),
      battery: new Battery(this.renderer),
    }

    window.addEventListener('resize', () => {
      this.renderer.updateCanvas()
      this.update(this.lastData ?? {})
    })
  }

  clear() {
    this.renderer.clear()
  }

  update(telemetryData = {}) {
    this.lastData = telemetryData
    this.renderer.clear()
    this.components.compass.draw(telemetryData.heading ?? 0)
    this.components.crosshair.draw()
    this.components.pitchLadder.draw(telemetryData.pitch ?? 0, telemetryData.roll ?? 0)
    this.components.rollIndicator.draw(telemetryData.roll ?? 0)
    this.components.altitude.draw(telemetryData.altitude ?? 0)
    this.components.speed.draw(telemetryData.speed ?? 0)
    this.components.battery.draw(telemetryData.level ?? 0, telemetryData.charging ?? false)
  }
}
