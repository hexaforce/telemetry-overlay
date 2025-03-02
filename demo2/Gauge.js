;(function (global, factory) {
  const Gauge = factory(global)

  if (typeof define === 'function' && define.amd) {
    // AMD support
    define(() => Gauge)
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS support
    module.exports = Gauge
  } else {
    // Browser global
    global.Gauge = Gauge
  }
})(typeof window === 'undefined' ? this : window, (global) => {
  const document = global.document
  const requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || ((cb) => setTimeout(cb, 1000 / 60))

  const SVG_NS = 'http://www.w3.org/2000/svg'

  /**
   * Animation utility for smooth transitions.
   */
  class Animation {
    constructor(options) {
      this.duration = options.duration
      this.start = options.start || 0
      this.end = options.end
      this.change = this.end - this.start
      this.step = options.step
      this.easing =
        options.easing ||
        ((pos) => {
          if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3)
          return 0.5 * (Math.pow(pos - 2, 3) + 2)
        })
      this.currentIteration = 1
      this.iterations = 60 * this.duration
    }

    animate() {
      const progress = this.currentIteration / this.iterations
      const value = this.change * this.easing(progress) + this.start
      this.step(value, this.currentIteration)
      this.currentIteration += 1

      if (progress < 1) {
        requestAnimationFrame(() => this.animate())
      }
    }

    startAnimation() {
      requestAnimationFrame(() => this.animate())
    }
  }

  /**
   * Utility functions for SVG and math operations.
   */
  const Utils = {
    createSVGElement(label, attrs, children) {
      const elem = document.createElementNS(SVG_NS, label)
      for (const attrName in attrs) {
        elem.setAttribute(attrName, attrs[attrName])
      }
      if (children) {
        children.forEach((child) => elem.appendChild(child))
      }
      return elem
    },

    getAngle(percentage, gaugeSpanAngle) {
      return (percentage * gaugeSpanAngle) / 100
    },

    normalize(value, min, max) {
      let val = Number(value)
      if (val < 0) val += min
      return Math.min(val, max)
    },

    getValueInPercentage(value, min, max) {
      const newMax = max - min
      const newVal = value - min
      return (100 * newVal) / newMax
    },

    getCartesian(cx, cy, radius, angle) {
      const rad = (angle * Math.PI) / 180
      return {
        x: Math.round((cx + radius * Math.cos(rad)) * 1000) / 1000,
        y: Math.round((cy + radius * Math.sin(rad)) * 1000) / 1000,
      }
    },

    getDialCoords(radius, startAngle, endAngle) {
      const cx = 50
      const cy = 50
      return {
        start: this.getCartesian(cx, cy, radius, startAngle),
        end: this.getCartesian(cx, cy, radius, endAngle),
      }
    },

    pathString(radius, startAngle, endAngle, largeArc = 1) {
      const { start, end } = this.getDialCoords(radius, startAngle, endAngle)
      return ['M', start.x, start.y, 'A', radius, radius, 0, largeArc, 1, end.x, end.y].join(' ')
    },
  }

  /**
   * Gauge class for creating and managing the gauge.
   */
  class Gauge {
    constructor(container, options = {}) {
      this.container = container
      this.options = { ...Gauge.defaultOptions, ...options }
      this.initialize()
    }

    static defaultOptions = {
      dialRadius: 45,
      offset: 10,
      min: 0,
      max: 270,
      value: 100,
      ticks: 9,
      precision: 2,
      startAngle: 135,
      endAngle: 45,
      displayNeedle: true,
      displayScale: true,
      displaySmallScale: true,
      displayValue: true,
      title: 'Speed',
      units: 'Km/h',
      gaugeColor: null,
    }

    initialize() {
      this.radius = this.options.dialRadius - this.options.offset
      this.createSVGElements()
      this.updateGauge(this.options.value)
      if (this.options.displayNeedle) this.drawNeedle()
    }

    createSVGElements() {
      const { startAngle, endAngle, title, units, displayScale } = this.options

      // Create SVG elements
      this.titleText = Utils.createSVGElement('text', { x: 50, y: 35, class: 'rockiot-title-text' }, [document.createTextNode(title)])
      this.unitsText = Utils.createSVGElement('text', { x: 50, y: 40, class: 'rockiot-units-text' }, [document.createTextNode(units)])
      this.valueText = Utils.createSVGElement('text', { x: 50, y: 65, class: 'rockiot-radial-value-text', 'font-size': '0.55rem' })

      this.barPath = Utils.createSVGElement('path', { class: 'rockiot-bar', d: Utils.pathString(this.radius, startAngle, endAngle) })
      this.barFilledPath = Utils.createSVGElement('path', { class: 'rockiot-bar-filled', d: Utils.pathString(this.radius, startAngle, startAngle) })

      this.rootSvg = Utils.createSVGElement('svg', { viewBox: '0 0 100 100', class: 'rockiot-svg' }, [this.barPath, this.barFilledPath, this.valueText, this.titleText, this.unitsText])

      if (this.options.displayNeedle) {
        this.rootSvg.appendChild(Utils.createSVGElement('circle', { class: 'rockiot-needle-circle', cx: 50, cy: 50, r: 2, fill: 'red' }))
      }

      if (displayScale) {
        this.createScale()
      }

      this.container.appendChild(this.rootSvg)
    }

    createScale() {
      const { startAngle, endAngle, min, max, ticks } = this.options
      const scaleGroup = Utils.createSVGElement('g', { class: 'rockiot-scale' })

      const startTick = startAngle + 90
      const factor = (360 - (startAngle - endAngle)) / (ticks * 10)

      for (let n = 0; n <= ticks * 10; n++) {
        const yT = 50 - this.options.dialRadius + this.options.dialRadius / 10
        const dT = n % 10 === 0 ? 5 : 2

        if (n % 10 === 0 || this.options.displaySmallScale) {
          const tickLine = Utils.createSVGElement('line', {
            x1: 50,
            y1: yT,
            x2: 50,
            y2: yT + dT,
            class: 'rockiot-radial-scale-tick',
            transform: `rotate(${n * factor + startTick} 50 50)`,
          })

          scaleGroup.appendChild(tickLine)

          if (n % 10 === 0) {
            const scaleText = Utils.createSVGElement(
              'text',
              {
                x: 50,
                y: yT - 1,
                class: 'rockiot-radial-scale-text',
                transform: `rotate(${n * factor + startTick} 50 50)`,
              },
              [document.createTextNode((n * (max / ticks / 10) + min).toFixed(0))],
            )
            scaleGroup.appendChild(scaleText)
          }
        }
      }

      this.rootSvg.appendChild(scaleGroup)
    }

    drawNeedle() {
      const needleCoord = this.barFilledPath.getAttribute('d').split(' ')
      if (document.querySelector('.rockiot-needle')) {
        document.querySelector('.rockiot-needle').remove()
      }
      const needle = Utils.createSVGElement('line', {
        class: 'rockiot-needle',
        x1: 50,
        y1: 50,
        x2: needleCoord[needleCoord.length - 2],
        y2: needleCoord[needleCoord.length - 1],
      })

      this.rootSvg.appendChild(needle)
    }

    updateGauge(value) {
      const { min, max, startAngle, endAngle, precision } = this.options
      const percentage = Utils.getValueInPercentage(value, min, max)
      const angle = Utils.getAngle(percentage, 360 - Math.abs(startAngle - endAngle))
      const flag = angle <= 180 ? 0 : 1

      this.barFilledPath.setAttribute('d', Utils.pathString(this.radius, startAngle, angle + startAngle, flag))
      if (this.options.displayValue) {
        this.valueText.textContent = value.toFixed(precision)
      }
      if (this.options.displayNeedle) {
        this.drawNeedle()
      }
    }

    setValue(value) {
      this.options.value = Utils.normalize(value, this.options.min, this.options.max)
      this.updateGauge(this.options.value)
    }

    setValueAnimated(value, duration = 1) {
      const oldValue = this.options.value
      this.options.value = Utils.normalize(value, this.options.min, this.options.max)

      new Animation({
        start: oldValue,
        end: this.options.value,
        duration,
        step: (val) => this.updateGauge(val),
      }).startAnimation()
    }

    getValue() {
      return this.options.value
    }

    getRange() {
      return { min: this.options.min, max: this.options.max }
    }
  }

  return Gauge
})
