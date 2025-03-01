(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["build/rockiot.gauge.linear"],{

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.linear.horizontal.svg.vue?vue&type=script&lang=js":
/*!******************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/rockiot.linear.horizontal.svg.vue?vue&type=script&lang=js ***!
  \******************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* eslint-disable */
/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'RockiotSvgLinearH',
  data: function data() {
    return {
      svgwidth: 370,
      svgheight: 90,
      offsetX: 20,
      offsetY: 60,
      barHeight: 20,
      scaleY: 0,
      range: 100,
      factor: 3.5,
      posFactor: 3.5,
      svg: null,
      scaleX: 90,
      offsetText: 10,
      pos: 0,
      snapObject: null,
      aniPos: [0, 0],
      oldValue: 0,
      aniValue: 0,
      limitzones: null,
      showScale: true
    };
  },
  computed: {
    scaleStyle: function scaleStyle() {
      return this.showScale ? 'stroke:' + this.$attrs.scaleColor + ';' : 'display:none;stroke:' + this.$attrs.scaleColor + ';';
    },
    scaleTextColor: function scaleTextColor() {
      return 'fill:' + this.$attrs.scaleTextColor + ';';
    },
    outlineStyle: function outlineStyle() {
      return 'fill:' + this.$attrs.barColor + ';stroke:' + this.$attrs.barBorderColor + ';';
    },
    fillStyle: function fillStyle() {
      return 'fill:' + this.$attrs.progressColor + ';stroke:transparent;' + this.animate('width');
    },
    zoneWidth: function zoneWidth() {
      return (this.svgwidth - this.offsetX * 2) / this.limitzones.length;
    }
  },
  watch: {
    '$attrs.value': function $attrsValue(v) {
      if (Number(v) > Number(this.$attrs.max)) {
        v = Number(this.$attrs.max);
      }
      this.pos = (this.svgwidth - this.offsetX * 2) * this.normalize(Number(v)) / 100;
    },
    $attrs: function $attrs(v) {
      if (v.scale === '0') {
        this.showScale = false;
      } else {
        this.showScale = true;
      }
      this.createGauge();
    }
  },
  methods: {
    calcWidth: function calcWidth(v) {
      if (Number(v) > Number(this.$attrs.max)) {
        v = Number(this.$attrs.max);
      }
      this.pos = (this.svgwidth - this.offsetX * 2) * this.normalize(Number(v)) / 100;
    },
    normalize: function normalize(val) {
      return (val + parseInt(this.$attrs.min) * -1) / this.range * 100;
    },
    animate: function animate(attr) {
      if (this.$attrs.animation) {
        return 'transition: ' + attr + ' ' + parseFloat(this.$attrs.animation / 1000) + 's linear;';
      }
      return '';
    },
    gaugeSize: function gaugeSize() {
      switch (this.$attrs.size) {
        case 'md':
          this.offsetX = 20;
          this.offsetY = 70;
          this.barHeight = 25;
          this.scaleY = -15;
          break;
        case 'sm':
          this.offsetX = 20;
          this.offsetY = 70;
          this.barHeight = 10;
          this.scaleY = 0;
          break;
        case 'lg':
          this.offsetX = 20;
          this.offsetY = 85;
          this.barHeight = 40;
          this.scaleY = -30;
          break;
        default:
          this.offsetX = 20;
          this.offsetY = 70;
          this.barHeight = 25;
          this.scaleY = -15;
          break;
      }
    },
    setSVGAttributes: function setSVGAttributes(elmt, oAtt) {
      for (var prop in oAtt) {
        elmt.setAttributeNS(null, prop, oAtt[prop]);
      }
    },
    createScale: function createScale() {
      if (this.showScale) {
        this.svg.scale = this.$refs['scale-' + this.$attrs.serial];
        this.svg.scale.children.length ? this.svg.scale.innerHTML = '' : null;
        var data = this.$attrs;
        var NS = 'http://www.w3.org/2000/svg';
        var width = parseInt(this.svgwidth) - this.offsetX - this.offsetX;
        var fs = width / parseInt(this.$attrs.ticks) / 10;
        var n = 0;
        var txt = 0;
        for (var sa = 0; n <= parseInt(this.$attrs.ticks) * 10; sa += fs) {
          var scaleLine = document.createElementNS(NS, 'line');
          var h = 5;
          var classe = 'scale scale-major-ticks';
          if (!!parseInt(this.$attrs.smallscale)) {
            if (n % 10 != 0 && n > 0) {
              classe = 'scale scale-minor-ticks';
              h = 0;
              var scaleLineObj = {
                "class": classe,
                style: this.scaleStyle,
                x1: sa + this.offsetX,
                y1: this.offsetY,
                x2: sa + this.offsetX,
                y2: this.offsetY - 20 - h + this.scaleY
              };
              this.setSVGAttributes(scaleLine, scaleLineObj);
              this.svg.scale.appendChild(scaleLine);
            }
          }
          if (n % 10 === 0 || n === 0) {
            var scaleLineObj = {
              "class": classe,
              style: this.scaleStyle,
              x1: sa + this.offsetX,
              y1: this.offsetY,
              x2: sa + this.offsetX,
              y2: this.offsetY - 20 - h + this.scaleY
            };
            this.setSVGAttributes(scaleLine, scaleLineObj);
            this.svg.scale.appendChild(scaleLine);
          }
          if (n % 10 === 0 || n === 0) {
            var mg = 0;
            if (n === 0 || n === parseInt(this.$attrs.ticks)) {
              mg = 4;
            }
            var scaleText = document.createElementNS(NS, 'text');
            var scaleTextObj = {
              "class": 'scaleNumbersLinear',
              stroke: 'transparent',
              style: this.scaleTextColor,
              x: sa + this.offsetX,
              y: this.offsetY - 30 + this.scaleY
            };
            this.setSVGAttributes(scaleText, scaleTextObj);
            //var range = parseInt(this.$attrs.max)-(parseInt(this.$attrs.min))

            var tick = this.range / parseInt(this.$attrs.ticks);
            txt = parseInt(this.$attrs.min) + n / 10 * tick;
            scaleText.textContent = parseInt(txt);
            this.svg.scale.appendChild(scaleText);
          }
          n++;
        }
      }
    },
    createGauge: function createGauge() {
      var id = this.$attrs.serial;
      this.aniValue = parseInt(this.$attrs.value);
      if (this.$attrs.variation === 'linear' && this.$attrs.svgwidth > this.$attrs.svgheight) {
        this.svgwidth = this.$attrs.svgwidth;
        this.svgheight = this.$attrs.svgheight;
      }
      if (this.$attrs.svgwidth > this.$attrs.svgheight) {
        this.svgwidth = this.$attrs.svgheight;
        this.svgheight = this.$attrs.svgwidth;
      }
      var width = parseInt(this.svgwidth) - this.offsetX * 2;

      //this.svgwidth = document.getElementById(this.$attrs.serial).clientWidth - this.offsetX*2
      //width = this.svgwidth
      this.svg = this.$refs[id];
      this.svg.scale = this.$refs['scale-' + id];
      this.posFactor = width / parseInt(this.$attrs.max);
      this.range = parseInt(this.$attrs.max) - parseInt(this.$attrs.min);
      this.factor = width / this.range;
      if (parseInt(this.$attrs.value) > parseInt(this.$attrs.max)) {
        this.$attrs.value = this.$attrs.max;
      }
      //this.pos = this.normalize(Number(this.$attrs.value))*this.posFactor
      //this.pos = this.svgwidth*this.normalize(Number(this.$attrs.value))/100 - this.offsetX
      this.gaugeSize();
      if (!!parseInt(this.$attrs.scale)) {
        this.createScale();
      }
      if (this.$attrs.zones.split(',')) {
        this.limitzones = this.$attrs.zones.split(',');
      }
      this.aniPos[1] = this.pos; //this.factor
      this.calcWidth(this.$attrs.value);
    }
  },
  beforeMount: function beforeMount() {
    this.aniValue = parseInt(this.$attrs.value);
  },
  mounted: function mounted() {
    var id = this.$attrs.serial;
    this.aniValue = parseInt(this.$attrs.value);
    if (this.$attrs.variation === 'linear' && this.$attrs.svgwidth > this.$attrs.svgheight) {
      this.svgwidth = this.$attrs.svgwidth;
      this.svgheight = this.$attrs.svgheight;
    }
    if (this.$attrs.svgwidth > this.$attrs.svgheight) {
      this.svgwidth = this.$attrs.svgheight;
      this.svgheight = this.$attrs.svgwidth;
    }
    var width = parseInt(this.svgwidth) - this.offsetX * 2;

    //this.svgwidth = document.getElementById(this.$attrs.serial).clientWidth - this.offsetX*2
    //width = this.svgwidth
    this.svg = this.$refs[id];
    this.posFactor = width / parseInt(this.$attrs.max);
    this.range = parseInt(this.$attrs.max) - parseInt(this.$attrs.min);
    this.factor = width / this.range;
    if (parseInt(this.$attrs.value) > parseInt(this.$attrs.max)) {
      this.$attrs.value = this.$attrs.max;
    }
    //this.pos = this.normalize(Number(this.$attrs.value))*this.posFactor
    //this.pos = this.svgwidth*this.normalize(Number(this.$attrs.value))/100 - this.offsetX
    this.gaugeSize();
    if (!!parseInt(this.$attrs.scale)) {
      this.createScale();
    }
    if (this.$attrs.zones.split(',')) {
      this.limitzones = this.$attrs.zones.split(',');
    }
    this.aniPos[1] = this.pos; //this.factor
    this.calcWidth(this.$attrs.value);
  }
});

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.linear.vertical.svg.vue?vue&type=script&lang=js":
/*!****************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/rockiot.linear.vertical.svg.vue?vue&type=script&lang=js ***!
  \****************************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* eslint-disable */
/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'RockiotSvgLinearV',
  data: function data() {
    return {
      svgwidth: 120,
      svgheight: 370,
      offsetX: 20,
      offsetY: 20,
      barHeight: 40,
      scaleY: -20,
      factor: 3.5,
      range: 100,
      svg: null,
      scaleX: 90,
      offsetText: 10,
      pos: 0,
      oldValue: 0,
      aniValue: 0,
      limitzones: null,
      showScale: true
    };
  },
  computed: {
    scaleStyle: function scaleStyle() {
      return this.showScale ? 'stroke:' + this.$attrs.scaleColor + ';' : 'display:none;stroke:' + this.$attrs.scaleColor + ';';
    },
    scaleTextColor: function scaleTextColor() {
      if (this.$attrs.scaleTextColor) {
        return 'fill:' + this.$attrs.scaleTextColor + ';font-size:.8rem;';
      }
    },
    outlineStyle: function outlineStyle() {
      return 'fill:' + this.$attrs.barColor + ';stroke:' + this.$attrs.barBorderColor + ';' + this.animate('height');
    },
    fillStyle: function fillStyle() {
      return 'fill:' + this.$attrs.progressColor + ';stroke:transparent;';
    },
    zoneHeight: function zoneHeight() {
      var height = this.svgheight - this.offsetY * 2;
      return (this.svgheight - this.offsetY * 2) / this.limitzones.length;
    }
  },
  watch: {
    '$attrs.value': function $attrsValue(v) {
      if (parseFloat(v) > parseInt(this.$attrs.max)) {
        this.pos = this.normalize(parseFloat(this.$attrs.max)) * this.posFactor;
      } else {
        this.pos = (this.normalize(v) - parseFloat(this.$attrs.min) * -1) * this.posFactor;
      }
      this.aniValue = v;
    },
    $attrs: function $attrs(v) {
      if (v.scale === '0') {
        this.showScale = false;
      } else {
        this.showScale = true;
      }
      this.createGauge();
    }
  },
  methods: {
    normalize: function normalize(val) {
      if (Number(this.$attrs.min) < 0) {
        var n = Number(this.$attrs.max) - Number(this.$attrs.max) * ((parseFloat(val).toFixed(this.$attrs.precision) - Number(this.$attrs.min)) / this.range * 100) / 100;
        return n;
      } else {
        if (Number(this.$attrs.min) > 0) {
          var _n = Number(this.$attrs.max) - Number(this.$attrs.max) * ((val - Number(this.$attrs.min)) / this.range * 100) / 100;
          return _n;
        } else {
          return Number(this.$attrs.max) - Number(this.$attrs.max) * (val / this.range * 100) / 100;
        }
      }
    },
    animate: function animate(attr) {
      if (this.$attrs.animation) {
        return 'transition: ' + attr + ' ' + parseFloat(this.$attrs.animation / 1000) + 's linear;';
      }
      return '';
    },
    gaugeSize: function gaugeSize() {
      switch (this.$attrs.size) {
        case 'md':
          this.offsetY = 20;
          this.barHeight = 30;
          this.offsetX = this.svgwidth / 2 - this.barHeight / 2;
          this.scaleY = -25;
          this.scaleX = 70;
          break;
        case 'sm':
          this.offsetY = 20;
          this.barHeight = 10;
          this.offsetX = this.svgwidth / 2 - this.barHeight / 2;
          this.scaleY = 0;
          this.scaleX = 60;
          break;
        case 'lg':
          this.offsetY = 20;
          this.barHeight = 40;
          this.offsetX = this.svgwidth / 2 - this.barHeight / 2;
          this.scaleX = 80;
          break;
        default:
          this.offsetY = 20;
          this.barHeight = 30;
          this.offsetX = this.svgwidth / 2 - this.barHeight / 2;
          this.scaleY = -25;
          this.scaleX = 30;
          break;
      }
    },
    setSVGAttributes: function setSVGAttributes(elmt, oAtt) {
      for (var prop in oAtt) {
        elmt.setAttributeNS(null, prop, oAtt[prop]);
      }
    },
    createScale: function createScale() {
      this.svg.scale = this.$refs['scale-' + this.$attrs.serial];
      this.svg.scale.children.length ? this.svg.scale.innerHTML = '' : null;
      var NS = 'http://www.w3.org/2000/svg';
      var height = parseInt(this.svgheight) - this.offsetY * 2;
      var minor = parseInt(this.$attrs.smallscale) ? 10 : 1;
      var ticks = parseInt(this.$attrs.ticks) * minor;
      var fs = height / parseInt(this.$attrs.ticks) / minor;
      var txt = 0;
      for (var n = 0; n <= ticks; n++) {
        var scaleLine = document.createElementNS(NS, 'line');
        var h = 15;
        if (minor > 1) {
          if (n % 10 != 0 && n > 0) {
            h = 10;
          } else {
            h = 15;
          }
          var xPos = this.svgwidth / 2;
          var scaleLineObj = {
            "class": 'scale rockiot-scale',
            style: this.scaleStyle,
            x1: this.scaleX,
            y1: n * fs + this.offsetY,
            x2: this.scaleX + h,
            y2: n * fs + this.offsetY
          };
          this.setSVGAttributes(scaleLine, scaleLineObj);
          this.svg.scale.appendChild(scaleLine);
        } else {
          var xPos = this.svgwidth / 2;
          var scaleLineObj = {
            "class": 'scale rockiot-scale',
            style: this.scaleStyle,
            x1: this.scaleX,
            y1: n * fs + this.offsetY,
            x2: this.scaleX + h,
            y2: n * fs + this.offsetY
          };
          this.setSVGAttributes(scaleLine, scaleLineObj);
          this.svg.scale.appendChild(scaleLine);
        }
        var mg = 0;
        if (n === 0 || n === parseInt(this.$attrs.ticks)) {
          mg = 4;
        }
        var scaleText = document.createElementNS(NS, 'text');
        var scaleTextObj = {
          "class": 'scaleNumbersLinear',
          style: this.scaleTextColor,
          x: this.svgwidth - 15,
          y: n * fs + this.offsetY + 5
        };
        this.setSVGAttributes(scaleText, scaleTextObj);
        var range = parseInt(this.$attrs.max) - parseInt(this.$attrs.min);
        var tick = range / parseInt(this.$attrs.ticks);
        txt = parseInt(this.$attrs.max) - n * tick / minor;
        if (n % 10 === 0 || minor === 1) {
          scaleText.textContent = parseInt(txt);
          this.svg.scale.appendChild(scaleText);
        }
      }
    },
    createGauge: function createGauge() {
      var id = this.$attrs.serial;
      var height = parseInt(this.svgheight) - this.offsetY * 2;
      this.svg = this.$refs[id];
      this.svg.scale = this.$refs['scale-' + id];
      this.factor = height / (parseInt(this.$attrs.max) - parseInt(this.$attrs.min));
      this.posFactor = height / Number(this.$attrs.max);
      this.gaugeSize();
      if (parseInt(this.$attrs.value) > parseInt(this.$attrs.max)) {
        this.$attrs.value = 0;
      }
      this.range = Number(this.$attrs.max) - Number(this.$attrs.min);
      this.pos = this.normalize(Number(this.$attrs.value)) * this.posFactor;
      if (!!parseInt(this.$attrs.scale)) {
        this.createScale();
      }
      if (this.$attrs.zones) {
        this.limitzones = this.$attrs.zones.split(',');
      }
    }
  },
  beforeMount: function beforeMount() {
    this.aniValue = parseInt(this.$attrs.value);
  },
  mounted: function mounted() {
    var id = this.$attrs.serial;
    var height = parseInt(this.svgheight) - this.offsetY * 2;
    this.svg = this.$refs[id];
    this.svg.scale = this.$refs['scale-' + id];
    this.range = parseInt(this.$attrs.max) - parseInt(this.$attrs.min);
    this.factor = height / (parseInt(this.$attrs.max) - parseInt(this.$attrs.min));
    this.posFactor = height / Number(this.$attrs.max);
    this.gaugeSize();
    this.range = Number(this.$attrs.max) - Number(this.$attrs.min);
    this.pos = this.normalize(Number(this.$attrs.value)) * this.posFactor;
    if (!!parseInt(this.$attrs.scale)) {
      this.createScale();
    }
    if (this.$attrs.zones) {
      this.limitzones = this.$attrs.zones.split(',');
    }
  }
});

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.linear.horizontal.svg.vue?vue&type=template&id=2fb57efe":
/*!****************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/vue-loader/lib??vue-loader-options!./src/components/rockiot.linear.horizontal.svg.vue?vue&type=template&id=2fb57efe ***!
  \****************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', {
    staticStyle: {
      "padding-top": "1rem"
    }
  }, [_c('svg', {
    ref: _vm.$attrs.serial,
    "class": 'typeRange rockiot-gauge rockiot-gauge-' + _vm.$attrs.size,
    style: _vm.$attrs.svgStyle,
    attrs: {
      "height": _vm.svgheight,
      "width": _vm.svgwidth,
      "view-box": '0 0 ' + _vm.svgwidth + ' ' + _vm.svgheight,
      "id": _vm.$attrs.serial
    }
  }, [_c('g', {
    ref: 'scale-' + _vm.$attrs.serial,
    staticClass: "scale",
    style: _vm.scaleStyle,
    attrs: {
      "stroke": "red"
    }
  }), _vm._v(" "), _c('rect', {
    staticClass: "outline",
    style: _vm.outlineStyle,
    attrs: {
      "id": 'outline-' + _vm.$attrs.serial,
      "x": _vm.offsetX,
      "width": _vm.svgwidth - _vm.offsetX * 2,
      "height": _vm.barHeight,
      "y": _vm.offsetY - _vm.barHeight
    }
  }), _vm._v(" "), _c('rect', {
    staticClass: "fill",
    style: _vm.fillStyle,
    attrs: {
      "id": 'fill-' + _vm.$attrs.serial,
      "x": _vm.offsetX,
      "width": _vm.pos,
      "height": _vm.barHeight,
      "y": _vm.offsetY - _vm.barHeight
    }
  }), _vm._v(" "), _vm.$attrs.needle === '1' ? _c('rect', {
    staticClass: "needle",
    style: _vm.animate('x'),
    attrs: {
      "id": 'needle-' + _vm.$attrs.serial,
      "width": "1",
      "x": this.pos + this.offsetX,
      "y": _vm.offsetY - _vm.barHeight - 5,
      "height": _vm.barHeight + 10,
      "fill": _vm.$attrs.needleColor
    }
  }) : _vm._e(), _vm._v(" "), _vm._l(_vm.limitzones, function (zone, i) {
    return [zone ? _c('rect', {
      key: 'zone-' + i,
      staticClass: "rockiot-zones",
      attrs: {
        "id": 'zones-' + i + '-' + _vm.$attrs.serial,
        "fill": zone,
        "x": _vm.offsetX + _vm.zoneWidth * i,
        "width": _vm.zoneWidth,
        "height": "3",
        "y": _vm.offsetY + 1
      }
    }) : _vm._e()];
  })], 2), _vm._v(" "), _c('div', {
    staticClass: "rockiot-gauge-linear-vertical-output"
  }, [_c('div', {
    staticClass: "rockiot-gauge-linear-vertical-name"
  }, [_vm._v(_vm._s(this.$attrs.name) + " " + _vm._s(this.$attrs.units))]), _vm._v(" "), _c('div', {
    "class": 'rockiot-gauge-value rockiot-gauge-' + _vm.$attrs.variation + '-' + _vm.$attrs.orientation + '-value'
  }, [_c('rockiot-animated-number', {
    ref: 'num_' + this.$attrs.serial,
    attrs: {
      "precision": _vm.$attrs.precision,
      "duration": _vm.$attrs.animation,
      "from": _vm.oldValue,
      "to": _vm.$attrs.value
    },
    on: {
      "end": function end($event) {
        _vm.oldValue = _vm.$attrs.value;
      }
    }
  })], 1)])]);
};
var staticRenderFns = [];
render._withStripped = true;


/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.linear.vertical.svg.vue?vue&type=template&id=0fbc6b50":
/*!**************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/vue-loader/lib??vue-loader-options!./src/components/rockiot.linear.vertical.svg.vue?vue&type=template&id=0fbc6b50 ***!
  \**************************************************************************************************************************************************************************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return staticRenderFns; });
var render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('div', [_c('svg', {
    ref: _vm.$attrs.serial,
    "class": ' rockiot-linear-vertical rockiot-gauge rockiot-gauge-' + _vm.$attrs.size,
    style: _vm.$attrs.svgStyle,
    attrs: {
      "height": _vm.svgheight,
      "width": _vm.svgwidth,
      "view-box": '0 0 ' + _vm.svgwidth + ' ' + _vm.svgheight,
      "id": _vm.$attrs.serial
    }
  }, [_c('g', {
    ref: 'scale-' + _vm.$attrs.serial,
    staticClass: "rockiot-scale",
    style: _vm.scaleStyle,
    attrs: {
      "stroke": "red"
    }
  }), _vm._v(" "), _c('rect', {
    staticClass: "rockiot-outline",
    style: _vm.fillStyle,
    attrs: {
      "id": 'outline-' + _vm.$attrs.serial,
      "x": _vm.offsetX,
      "height": _vm.svgheight - _vm.offsetY * 2,
      "width": _vm.barHeight,
      "y": _vm.offsetY
    }
  }), _vm._v(" "), _c('rect', {
    staticClass: "rockiot-fill",
    style: _vm.outlineStyle,
    attrs: {
      "id": 'fill-' + _vm.$attrs.serial,
      "x": _vm.offsetX,
      "height": _vm.pos,
      "width": _vm.barHeight,
      "y": _vm.offsetY
    }
  }), _vm._v(" "), _c('rect', {
    staticClass: "rockiot-needle",
    style: _vm.animate('y'),
    attrs: {
      "id": 'needle-' + _vm.$attrs.serial,
      "height": "1",
      "y": _vm.pos + _vm.offsetY,
      "x": _vm.offsetX,
      "width": _vm.barHeight,
      "fill": _vm.$attrs.needleColor
    }
  }), _vm._v(" "), _vm._l(_vm.limitzones, function (zone, i) {
    return [_c('rect', {
      key: 'zone-' + i,
      staticClass: "rockiot-zones",
      attrs: {
        "id": 'zones-' + i + '-' + _vm.$attrs.serial,
        "fill": zone,
        "x": _vm.offsetX - 6,
        "height": _vm.zoneHeight,
        "width": 5,
        "y": _vm.offsetY + _vm.zoneHeight * i
      }
    })];
  })], 2), _vm._v(" "), _c('div', {
    staticClass: "rockiot-gauge-linear-vertical-output"
  }, [_c('div', {
    staticClass: "rockiot-gauge-linear-vertical-name"
  }, [_vm._v(_vm._s(this.$attrs.name) + " " + _vm._s(this.$attrs.units))]), _vm._v(" "), _c('div', {
    "class": 'rockiot-gauge-value rockiot-gauge-' + _vm.$attrs.variation + '-' + _vm.$attrs.orientation + '-value'
  }, [_c('rockiot-animated-number', {
    ref: 'num_' + this.$attrs.serial,
    attrs: {
      "precision": _vm.$attrs.precision,
      "duration": _vm.$attrs.animation,
      "from": _vm.oldValue,
      "to": _vm.$attrs.value
    },
    on: {
      "end": function end($event) {
        _vm.oldValue = _vm.$attrs.value;
      }
    }
  })], 1)])]);
};
var staticRenderFns = [];
render._withStripped = true;


/***/ }),

/***/ "./src/components/rockiot.linear.horizontal.svg.vue":
/*!**********************************************************!*\
  !*** ./src/components/rockiot.linear.horizontal.svg.vue ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _rockiot_linear_horizontal_svg_vue_vue_type_template_id_2fb57efe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rockiot.linear.horizontal.svg.vue?vue&type=template&id=2fb57efe */ "./src/components/rockiot.linear.horizontal.svg.vue?vue&type=template&id=2fb57efe");
/* harmony import */ var _rockiot_linear_horizontal_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rockiot.linear.horizontal.svg.vue?vue&type=script&lang=js */ "./src/components/rockiot.linear.horizontal.svg.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _rockiot_linear_horizontal_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
  _rockiot_linear_horizontal_svg_vue_vue_type_template_id_2fb57efe__WEBPACK_IMPORTED_MODULE_0__["render"],
  _rockiot_linear_horizontal_svg_vue_vue_type_template_id_2fb57efe__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/components/rockiot.linear.horizontal.svg.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./src/components/rockiot.linear.horizontal.svg.vue?vue&type=script&lang=js":
/*!**********************************************************************************!*\
  !*** ./src/components/rockiot.linear.horizontal.svg.vue?vue&type=script&lang=js ***!
  \**********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_horizontal_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/babel-loader/lib??ref--4-0!../../node_modules/vue-loader/lib??vue-loader-options!./rockiot.linear.horizontal.svg.vue?vue&type=script&lang=js */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.linear.horizontal.svg.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_horizontal_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./src/components/rockiot.linear.horizontal.svg.vue?vue&type=template&id=2fb57efe":
/*!****************************************************************************************!*\
  !*** ./src/components/rockiot.linear.horizontal.svg.vue?vue&type=template&id=2fb57efe ***!
  \****************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_horizontal_svg_vue_vue_type_template_id_2fb57efe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/babel-loader/lib??ref--4-0!../../node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!../../node_modules/vue-loader/lib??vue-loader-options!./rockiot.linear.horizontal.svg.vue?vue&type=template&id=2fb57efe */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.linear.horizontal.svg.vue?vue&type=template&id=2fb57efe");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_horizontal_svg_vue_vue_type_template_id_2fb57efe__WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_horizontal_svg_vue_vue_type_template_id_2fb57efe__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ }),

/***/ "./src/components/rockiot.linear.vertical.svg.vue":
/*!********************************************************!*\
  !*** ./src/components/rockiot.linear.vertical.svg.vue ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _rockiot_linear_vertical_svg_vue_vue_type_template_id_0fbc6b50__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rockiot.linear.vertical.svg.vue?vue&type=template&id=0fbc6b50 */ "./src/components/rockiot.linear.vertical.svg.vue?vue&type=template&id=0fbc6b50");
/* harmony import */ var _rockiot_linear_vertical_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rockiot.linear.vertical.svg.vue?vue&type=script&lang=js */ "./src/components/rockiot.linear.vertical.svg.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _rockiot_linear_vertical_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
  _rockiot_linear_vertical_svg_vue_vue_type_template_id_0fbc6b50__WEBPACK_IMPORTED_MODULE_0__["render"],
  _rockiot_linear_vertical_svg_vue_vue_type_template_id_0fbc6b50__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/components/rockiot.linear.vertical.svg.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./src/components/rockiot.linear.vertical.svg.vue?vue&type=script&lang=js":
/*!********************************************************************************!*\
  !*** ./src/components/rockiot.linear.vertical.svg.vue?vue&type=script&lang=js ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_vertical_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/babel-loader/lib??ref--4-0!../../node_modules/vue-loader/lib??vue-loader-options!./rockiot.linear.vertical.svg.vue?vue&type=script&lang=js */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.linear.vertical.svg.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_vertical_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./src/components/rockiot.linear.vertical.svg.vue?vue&type=template&id=0fbc6b50":
/*!**************************************************************************************!*\
  !*** ./src/components/rockiot.linear.vertical.svg.vue?vue&type=template&id=0fbc6b50 ***!
  \**************************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_vertical_svg_vue_vue_type_template_id_0fbc6b50__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/babel-loader/lib??ref--4-0!../../node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!../../node_modules/vue-loader/lib??vue-loader-options!./rockiot.linear.vertical.svg.vue?vue&type=template&id=0fbc6b50 */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.linear.vertical.svg.vue?vue&type=template&id=0fbc6b50");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_vertical_svg_vue_vue_type_template_id_0fbc6b50__WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_linear_vertical_svg_vue_vue_type_template_id_0fbc6b50__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ })

}]);