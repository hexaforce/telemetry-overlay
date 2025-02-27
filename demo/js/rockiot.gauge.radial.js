;(window.webpackJsonp = window.webpackJsonp || []).push([
  [3],
  {
    264: function (t, s, r) {
      'use strict'
      r.r(s)
      r(127), r(80), r(52), r(53), r(33), r(122)
      var a = {
          name: 'RockiotRadialSvg',
          data: function () {
            return { svg: {}, gauge: null, progressColor: '', customize: null, isChanged: !1 }
          },
          watch: {
            '$attrs.value': function (t) {
              this.gauge.setValueAnimated(t, Number(this.$attrs.animation) / 1e3)
            },
            '$attrs.setting': function (t) {
              console.log(t), this.createGauge(), this.$emit('updated')
            },
          },
          computed: {
            dialRadius: function () {
              return 'md' === this.$attrs.radius ? 40 : 'lg' === this.$attrs.radius ? 45 : 'sm' === this.$attrs.radius ? 35 : 50
            },
          },
          methods: {
            setColor: function () {
              for (var t = this.$attrs.value, s = 0; s < this.progressColor.length; s++) {
                var r = this.progressColor[s].split(',')
                if (parseFloat(t) < parseFloat(r[0])) {
                  this.customize.value.style.stroke = r[1]
                  break
                }
              }
            },
            createGauge: function () {
              var t = this,
                s = parseFloat(this.$attrs.value)
              ;(this.$refs[this.$attrs.serial].innerHTML = ''),
                (this.gauge = Gauge(t.$refs[t.$attrs.serial], {
                  dialRadius: t.dialRadius,
                  dialStartAngle: parseInt(t.$attrs.startangle),
                  dialEndAngle: parseInt(t.$attrs.endangle),
                  min: parseInt(t.$attrs.min),
                  max: parseInt(t.$attrs.max),
                  label: function () {
                    return Math.round(t.$attrs.value)
                  },
                  ticks: t.$attrs.ticks,
                  precision: Number(t.$attrs.precision),
                  name: t.$attrs.name,
                  titleColor: t.$attrs.textColor,
                  units: t.$attrs.units,
                  showScale: !!parseInt(t.$attrs.scale),
                  showSmallScale: !!parseInt(t.$attrs.smallscale),
                  needle: !!parseInt(t.$attrs.needle),
                  value: parseFloat(s),
                  valueColor: t.$attrs.valueColor,
                  valueClass: t.$attrs.valueClass,
                  serial: t.$attrs.serial,
                  gaugeClass: 'rockiot-svg rockiot-svg-' + t.$attrs.serial + ' gauge-' + t.$attrs.serial,
                  dialClass: 'rockiot-dial rockiot-dial-' + t.$attrs.size + ' rockiot-dial-' + t.$attrs.serial,
                  valueDialClass: 'rockiot-value rockiot-value-' + t.$attrs.size + ' rockiot-value-' + t.$attrs.serial,
                  svg: t.svg,
                  barColor: t.$attrs.barColor,
                  progressColor: t.$attrs.progressColor,
                  needleColor: t.$attrs.needleColor,
                  scaleColor: t.$attrs.scaleColor,
                })),
                document.querySelector('.rockiot-svg-' + this.$attrs.serial).setAttribute('ref', 'rockiot-svg-' + this.$attrs.serial),
                (this.customize = { gauge: document.querySelector('.rockiot-svg-' + this.$attrs.serial), dial: document.querySelector('.rockiot-dial-' + this.$attrs.serial), value: document.querySelector('.rockiot-value-' + this.$attrs.serial) }),
                (this.customize.dial.style.stroke = this.$attrs.barColor),
                (this.customize.value.style.stroke = this.$attrs.progressColor)
            },
          },
          mounted: function () {
            this.$attrs.progressColor.split(';').length > 1 && (this.progressColor = this.$attrs.progressColor.split(';')), this.createGauge(), this.setColor(), (this.svg = document.querySelector('.gauge-' + this.$attrs.serial)), (this.svg.hasscale = this.$attrs.scale), (this.svg.ticks = this.$attrs.ticks), (this.svg.factor = this.factor), (this.svg.degree = this.$attrs.degree), (this.svg.offset = 10), (this.svg.id = this.$attrs.serial), (this.svg.W = this.$attrs.svgwidth), (this.svg.min = this.$attrs.min), (this.svg.max = this.$attrs.max)
          },
        },
        e = r(7),
        i = Object(e.a)(
          a,
          function () {
            var t = this,
              s = t.$createElement
            return (t._self._c || s)('div', { ref: t.$attrs.serial, class: t.$attrs.gaugeClass, style: 'width:' + t.$attrs.svgwidth + 'px;height:' + t.$attrs.svgheight + 'px;' + t.$attrs.svgStyle, attrs: { width: t.$attrs.svgwidth, height: t.$attrs.svgwidth, id: t.$attrs.serial, value: t.$attrs.value } })
          },
          [],
          !1,
          null,
          null,
          null,
        )
      s.default = i.exports
    },
    265: function (t, s, r) {
      'use strict'
      r.r(s)
      r(80), r(52), r(53), r(33), r(122)
      var a = {
          name: 'RockiotGaugeLevel',
          components: { RockiotAnimatedNumber: r(50).a },
          data: function () {
            return { perc: 0, oldValue: 0, maskV: 0, aniValue: 0, range: 100, border: '', colors: null, ranges: null }
          },
          computed: {
            mask: function () {
              var t = this.normalize(parseFloat(this.$attrs.value))
              return (this.border = t < 10 ? 'border-bottom-left-radius:2rem;border-bottom-right-radius:2rem;' : ''), t
            },
            container: function () {
              return this.$attrs.levelCss
            },
            level: function () {
              if (this.$attrs.autoColor) {
                if (parseInt(this.$attrs.value) < 25 && parseInt(this.$attrs.value) > 10) return '#ff8800'
                if (parseInt(this.$attrs.value) < 10) return '#ff0000'
                if (parseInt(this.$attrs.value) > 75) return '#00ff00'
              }
              return this.$attrs.progressColor
            },
            levelStroke: function () {
              return parseInt(this.$attrs.value) < 15 ? '#ff0000' : '#000'
            },
          },
          methods: {
            normalize: function (t) {
              return ((Number(t) + -1 * parseInt(this.$attrs.min)) / this.range) * 100
            },
          },
          beforeMount: function () {
            ;(this.range = Number(this.$attrs.max) - Number(this.$attrs.min)), (this.aniValue = parseInt(this.$attrs.value)), (this.perc = this.normalize(parseFloat(this.$attrs.value))), this.$attrs.progressColor.split(';').length > 1 ? ((this.colors = this.$attrs.progressColor.split(';')[1]), (this.ranges = this.$attrs.progressColor.split(';')[0])) : (this.colors = this.$attrs.progressColor)
          },
        },
        e = r(7),
        i = Object(e.a)(
          a,
          function () {
            var t = this,
              s = t.$createElement,
              r = t._self._c || s
            return r('div', { ref: t.$attrs.serial, class: t.$attrs.gaugeClass, style: 'width:' + t.$attrs.svgwidth + 'px;height:' + t.$attrs.svgheight + 'px;' + t.$attrs.svgStyle, attrs: { width: t.$attrs.svgwidth, height: t.$attrs.svgwidth, id: t.$attrs.serial, value: t.$attrs.value } }, [
              r('div', { staticClass: 'rockiot-gauge-level-wrapper', style: 'background:' + t.$attrs.barColor }, [r('svg', { ref: 'rockiot-gauge-level-' + t.$attrs.serial, attrs: { width: '100%', height: '100%' } }, [r('linearGradient', { attrs: { id: 'lg-' + t.$attrs.serial, x1: '0.5', y1: '1', x2: '0.5', y2: '0' } }, [r('stop', { attrs: { offset: '0%', 'stop-opacity': '1', 'stop-color': t.level } }), t._v(' '), r('stop', { attrs: { offset: t.mask + '%', 'stop-opacity': '1', 'stop-color': t.level } }, [r('animate', { attrs: { attributeName: 'offset', values: '0;1;0', repeatCount: '1', dur: '1s', begin: '0s' } })]), t._v(' '), r('stop', { attrs: { offset: t.mask + '%', 'stop-opacity': '0', 'stop-color': t.level } }, [r('animate', { attrs: { attributeName: 'offset', values: '0;1;0', repeatCount: '1', dur: '1s', begin: '0s' } })]), t._v(' '), r('stop', { attrs: { offset: '100%', 'stop-opacity': '0', 'stop-color': t.level } })], 1), t._v(' '), r('circle', { attrs: { cx: '50%', cy: '50%', r: '48%', fill: 'url(#lg-' + t.$attrs.serial + ')', stroke: t.$attrs.barBorderColor, 'stroke-width': '8' } })], 1)]),
              t._v(' '),
              r(
                'div',
                { staticClass: 'rockiot-level-value', style: 'color:' + this.$attrs.valueColor },
                [
                  r('rockiot-animated-number', {
                    ref: 'num_' + this.$attrs.serial,
                    attrs: { precision: t.$attrs.precision, duration: t.$attrs.animation, from: t.oldValue, to: t.$attrs.value },
                    on: {
                      end: function (s) {
                        t.oldValue = t.$attrs.value
                      },
                    },
                  }),
                ],
                1,
              ),
            ])
          },
          [],
          !1,
          null,
          null,
          null,
        )
      s.default = i.exports
    },
  },
])
