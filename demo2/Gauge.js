;(function (global, factory) {
  let Gauge = factory(global)
  if (typeof define === 'function' && define.amd) {
    // AMD support
    define(function () {
      return Gauge
    })
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS support
    module.exports = Gauge
  } else {
    // We are probably running in the browser
    global.Gauge = Gauge
  }
})(typeof window === 'undefined' ? this : window, function (global, undefined) {
  let document = global.document
  let slice = Array.prototype.slice
  let requestAnimationFrame =
    global.requestAnimationFrame ||
    global.mozRequestAnimationFrame ||
    global.webkitRequestAnimationFrame ||
    global.msRequestAnimationFrame ||
    function (cb) {
      return setTimeout(cb, 1000 / 60)
    }

  const SVG_NS = 'http://www.w3.org/2000/svg'

  // EXPERIMENTAL!!
  /**
   * Simplistic animation function for animating the gauge. That's all!
   * Options are:
   * {
   *  duration: 1,    // In seconds
   *  start: 0,       // The start value
   *  end: 100,       // The end value
   *  step: function, // REQUIRED! The step function that will be passed the value and does something
   *  easing: function // The easing function. Default is easeInOutCubic
   * }
   */
  function Animation(options) {
    let duration = options.duration
    let currentIteration = 1
    let iterations = 60 * duration
    let start = options.start || 0
    let end = options.end
    let change = end - start
    let step = options.step
    let easing =
      options.easing ||
      function easeInOutCubic(pos) {
        // https://github.com/danro/easing-js/blob/master/easing.js
        if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3)
        return 0.5 * (Math.pow(pos - 2, 3) + 2)
      }

    function animate() {
      let progress = currentIteration / iterations
      let value = change * easing(progress) + start
      step(value, currentIteration)
      currentIteration += 1
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  let Gauge = (function () {
    let GaugeDefaults = {
      centerX: 50,
      centerY: 50,
    }

    let defaultOptions = {
      dialRadius: 45,
      offset: 10,
    }

    function shallowCopy(/* source, ...targets*/) {
      let target = arguments[0]
      let sources = slice.call(arguments, 1)
      sources.forEach(function (s) {
        for (let k in s) {
          if (s.hasOwnProperty(k)) {
            target[k] = s[k]
          }
        }
      })
      return target
    }

    /**
     * A utility function to create SVG dom tree
     * @param {String} name The SVG element name
     * @param {Object} attrs The attributes as they appear in DOM e.g. stroke-width and not strokeWidth
     * @param {Array} children An array of children (can be created by this same function)
     * @return The SVG element
     */
    function svg(label, attrs, children) {
      let elem = document.createElementNS(SVG_NS, label)
      for (let attrName in attrs) {
        elem.setAttribute(attrName, attrs[attrName])
      }

      if (children) {
        children.forEach(function (c) {
          elem.appendChild(c)
        })
      }
      return elem
    }

    /**
     * Translates percentage value to angle. e.g. If gauge span angle is 180deg, then 50%
     * will be 90deg
     */
    function getAngle(percentage, gaugeSpanAngle) {
      return (percentage * gaugeSpanAngle) / 100
    }

    function normalize(value, _min, _max) {
      let val = Number(value)
      if (Number(value) < 0) {
        val += _min
      }
      if (val > _max) return _max
      return val
    }

    function getValueInPercentage(value, _min, _max) {
      let mFactor = 1
      if (_min < 0) {
        _max -= _min * -1
      }
      let newMax = _max - _min * mFactor
      let newVal = value - _min * mFactor
      return (100 * newVal) / newMax
    }

    /**
     * Gets cartesian co-ordinates for a specified radius and angle (in degrees)
     * @param cx {Number} The center x co-oriinate
     * @param cy {Number} The center y co-ordinate
     * @param radius {Number} The radius of the circle
     * @param angle {Number} The angle in degrees
     * @return An object with x,y co-ordinates
     */
    function getCartesian(cx, cy, radius, angle) {
      let rad = (angle * Math.PI) / 180
      return {
        x: Math.round((cx + radius * Math.cos(rad)) * 1000) / 1000,
        y: Math.round((cy + radius * Math.sin(rad)) * 1000) / 1000,
      }
    }

    // Returns start and end points for dial
    // i.e. starts at 135deg ends at 45deg with large arc flag
    // REMEMBER!! angle=0 starts on X axis and then increases clockwise
    function getDialCoords(radius, startAngle, endAngle) {
      let cx = GaugeDefaults.centerX
      let cy = GaugeDefaults.centerY
      return {
        end: getCartesian(cx, cy, radius, endAngle),
        start: getCartesian(cx, cy, radius, startAngle),
      }
    }

    /**
     * Creates a Gauge object. This should be called without the 'new' operator. Various options
     * can be passed for the gauge:
     * {
     *    dialStartAngle: The angle to start the dial. MUST be greater than dialEndAngle. Default 135deg
     *    dialEndAngle: The angle to end the dial. Default 45deg
     *    radius: The gauge's radius. Default 400
     *    max: The maximum value of the gauge. Default 100
     *    value: The starting value of the gauge. Default 0
     *    label: The function on how to render the center label (Should return a value)
     * }
     * @param {Element} elem The DOM into which to render the gauge
     * @param {Object} opts The gauge options
     * @return a Gauge object
     */
    return function Gauge(elem, opts) {
      opts = shallowCopy({}, defaultOptions, opts)

      let offset = opts.offset
      let serial = opts.serial

      let gaugeContainer = elem
      let max = 270
      let min = 0
      let precision = 2
      let radius = opts.dialRadius - offset
      let displayValue = true
      let displayScale = true
      let displaySmallScale = true
      let startAngle = 135
      let endAngle = 45
      // title ---------------------
      let title = 'Speed'
      // units ---------------------
      let units = 'Km/h'
      // value ---------------------
      let value = 100
      let gaugeColor = null
      let gaugeValueElem
      let gaugeValuePath
      let gaugeTitleElem
      let gaugeUnitsElem
      let viewBox = undefined //opts.viewBox,
      let instance
      let gaugeScale
      let needle = true
      let ticks = 9

      if (startAngle < endAngle) {
        console.log('WARN! startAngle < endAngle, Swapping')
        let tmp = startAngle
        startAngle = endAngle
        endAngle = tmp
      }

      function pathString(radius, startAngle, endAngle, largeArc) {
        let { start, end } = getDialCoords(radius, startAngle, endAngle)
        let largeArcFlag = typeof largeArc === 'undefined' ? 1 : largeArc
        return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y].join(' ')
      }

      function initializeGauge(elem) {
        gaugeTitleElem = svg('text', { x: 50, y: 35, class: 'rockiot-title-text' })
        gaugeTitleElem.append(title)

        gaugeUnitsElem = svg('text', { x: 50, y: 40, class: 'rockiot-units-text' })
        gaugeUnitsElem.append(units)

        let valueFontSize = '0.' + (opts.dialRadius + 10) + 'rem'
        gaugeValueElem = svg('text', { x: 50, y: 65, class: 'rockiot-radial-value-text', 'font-size': valueFontSize })

        gaugeValuePath = svg('path', {
          class: `rockiot-value rockiot-value-md rockiot-value-${serial}`,
          fill: 'none',
          stroke: '#4ea5f1',
          'stroke-width': 2.5,
          d: pathString(radius, startAngle, startAngle), // value of 0
        })

        let angle = getAngle(100, 360 - Math.abs(startAngle - endAngle))
        let flag = angle <= 180 ? 0 : 1

        let gaugeDialEl = svg('path', {
          class: `rockiot-dial-md`,
          fill: 'none',
          stroke: '#e0e0e0',
          'stroke-width': 2,
          d: pathString(radius, startAngle, endAngle, flag),
        })

        let gaugeElement = svg(
          'svg',
          {
            viewBox: viewBox || '0 0 100 100',
            class: `rockiot-svg rockiot-svg-${serial} gauge-${serial}`,
          },
          [gaugeDialEl, gaugeValuePath, gaugeValueElem, gaugeTitleElem, gaugeUnitsElem],
        )
        elem.appendChild(gaugeElement)

        if (needle) {
          gaugeElement.appendChild(
            svg('circle', {
              class: 'rockiot-needle-circle',
              cx: 50,
              cy: 50,
              r: 2,
            }),
          )
        }

        if (displayScale) {
          gaugeScale = svg('g', {
            // class: 'rockiot-scale scale',
            // stroke: '#ff0000',
          })
          let tickLine
          let startTick = startAngle + 90
          let factor = (360 - (startAngle - endAngle)) / (ticks * 10)
          let scaleOffsetNumber = min
          if (opts.min < 0) {
            max = Math.abs(opts.min) + max
            scaleOffsetNumber = opts.min
            min = 0
          }
          if (opts.min > 0) {
            scaleOffsetNumber = opts.min
            max -= Math.abs(min)
          }
          for (let n = 0; n < ticks * 10 + 1; n++) {
            let yT = 50 - opts.dialRadius + opts.dialRadius / 10
            if (opts.dialRadius > 40) {
              yT -= 2
            }
            let dT = 2
            if (n % 10 === 0) {
              yT -= 3
              dT = 5
            }
            if (n % 10 === 0 || displaySmallScale) {
              tickLine = svg('line', {
                x1: 50,
                y1: yT,
                x2: 50,
                y2: yT + dT,
                class: 'rockiot-radial-scale-tick',
                transform: 'rotate(' + (n * factor + startTick) + ' 50 50)',
              })

              let numberOffset = 0
              if (n % 10 === 0) {
                if (n === 0 && startAngle - endAngle === 1) {
                  numberOffset =10
                }
                if (n === ticks * 10 && startAngle - endAngle === 1) {
                  numberOffset = -2
                }
                let scaleText = svg('text', {
                  x: 50 + numberOffset,
                  y: yT - 1,
                  class: 'rockiot-radial-scale-text',
                  transform: 'rotate(' + (n * factor + startTick) + ' 50 50)',
                })
                scaleText.append(parseFloat(n * (max / ticks / 10) + parseInt(scaleOffsetNumber)).toFixed(0))
                gaugeScale.appendChild(scaleText)
              }

              gaugeScale.appendChild(tickLine)
              gaugeElement.appendChild(gaugeScale)
            }
          }
        }
      }

      function drawNeedle() {
        let needleCoord = document
          .querySelector('.rockiot-value-' + serial)
          .getAttribute('d')
          .split(' ')
        if (document.querySelector('.rockiot-needle-' + serial)) {
          document.querySelector('.rockiot-needle-' + serial).remove()
        }
        document.querySelector('.rockiot-svg-' + serial).appendChild(
          svg('line', {
            class: 'rockiot-needle rockiot-needle-' + serial,
            x1: 50,
            y1: 50,
            x2: needleCoord[needleCoord.length - 2],
            y2: needleCoord[needleCoord.length - 1],
          }),
        )
      }

      function updateGauge(theValue, frame) {
        let lm = max
        let mn = min

        if (opts.min > 0) {
          mn = opts.min
          lm += opts.min
        }
        if (opts.min < 0) {
          mn = opts.min
        }
        let val = getValueInPercentage(theValue, mn, lm)
        let angle = getAngle(val, 360 - Math.abs(startAngle - endAngle))
        // this is because we are using arc greater than 180deg
        let flag = angle <= 180 ? 0 : 1
        gaugeValuePath.setAttribute('d', pathString(radius, startAngle, angle + startAngle, flag))
        if (needle) {
          drawNeedle()
        }
        if (displayValue) {
          gaugeValueElem.textContent = parseFloat(theValue).toFixed(precision)
        }
      }

      function setGaugeColor(value, duration) {
        let pathTransition = 'stroke ' + (duration * 1000) + 'ms ease'
        gaugeValuePath.style.stroke = gaugeColor(value)
        gaugeValuePath.style['-webkit-transition'] = pathTransition
        gaugeValuePath.style['-moz-transition'] = pathTransition
        gaugeValuePath.style.transition = pathTransition
      }

      instance = {
        setOptions: function (options) {
          console.log(options)
        },
        setMaxValue: function (newMax) {
          max = newMax
        },
        setValue: function (val) {
          value = val
          if (value < 0) {
            value += min
          }
          if (gaugeColor) {
            setGaugeColor(value, 0)
          }
          updateGauge(value)
        },
        setValueAnimated: function (val, duration) {
          let oldVal = value
          value = val
          value = normalize(val, min, max)
          if (oldVal === value) {
            return
          }
          if (gaugeColor) {
            setGaugeColor(value, duration)
          }
          Animation({
            start: oldVal || 0,
            end: parseFloat(value).toFixed(precision),
            duration: duration || 1,
            step: function (val, frame) {
              updateGauge(val, frame)
            },
          })
        },
        getValue: function () {
          return value
        },
        getRange: function () {
          return { min, max }
        },
      }
      initializeGauge(gaugeContainer)
      instance.setValue(value)
      if (needle) {
        drawNeedle()
      }
      return instance
    }
  })()
  return Gauge
})
