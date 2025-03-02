(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["build/rockiot.gauge.radial"],{

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.radial.svg.vue?vue&type=script&lang=js":
/*!*******************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib??vue-loader-options!./src/components/rockiot.radial.svg.vue?vue&type=script&lang=js ***!
  \*******************************************************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.function.name.js */ "./node_modules/core-js/modules/es.function.name.js");
/* harmony import */ var core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_function_name_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/es.number.constructor.js */ "./node_modules/core-js/modules/es.number.constructor.js");
/* harmony import */ var core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_number_constructor_js__WEBPACK_IMPORTED_MODULE_1__);


/* eslint-disable */
/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'RockiotRadialSvg',
  data: function data() {
    return {
      svg: {},
      gauge: null,
      progressColor: '',
      customize: null,
      isChanged: false
    };
  },
  watch: {
    '$attrs.value': function $attrsValue(v) {
      this.gauge.setValueAnimated(v, Number(this.$attrs.animation) / 1000);
    },
    '$attrs.setting': function $attrsSetting(v) {
      console.log(v);
      this.createGauge();
      this.$emit('updated');
    }
  },
  computed: {
    dialRadius: function dialRadius() {
      if (this.$attrs.radius === 'md') {
        return 40;
      }
      if (this.$attrs.radius === 'lg') {
        return 45;
      }
      if (this.$attrs.radius === 'sm') {
        return 35;
      }
      return 50;
    }
  },
  methods: {
    setColor: function setColor() {
      var self = this;
      var v = this.$attrs.value;
      for (var n = 0; n < this.progressColor.length; n++) {
        var color = self.progressColor[n].split(',');
        if (parseFloat(v) < parseFloat(color[0])) {
          this.customize.value.style.stroke = color[1];
          break;
        }
      }
    },
    createGauge: function createGauge() {
      var self = this;
      var value = parseFloat(this.$attrs.value);
      /* eslint-disable */
      this.$refs[this.$attrs.serial].innerHTML = '';
      this.gauge = Gauge(self.$refs[self.$attrs.serial], {
        dialRadius: self.dialRadius,
        dialStartAngle: parseInt(self.$attrs.startangle),
        dialEndAngle: parseInt(self.$attrs.endangle),
        min: parseInt(self.$attrs.min),
        max: parseInt(self.$attrs.max),
        label: function label() {
          return Math.round(self.$attrs.value);
        },
        ticks: self.$attrs.ticks,
        precision: Number(self.$attrs.precision),
        name: self.$attrs.name,
        titleColor: self.$attrs.textColor,
        units: self.$attrs.units,
        showScale: !!parseInt(self.$attrs.scale),
        showSmallScale: !!parseInt(self.$attrs.smallscale),
        needle: !!parseInt(self.$attrs.needle),
        value: parseFloat(value),
        valueColor: self.$attrs.valueColor,
        valueClass: self.$attrs.valueClass,
        serial: self.$attrs.serial,
        gaugeClass: 'rockiot-svg rockiot-svg-' + self.$attrs.serial + ' gauge-' + self.$attrs.serial,
        dialClass: 'rockiot-dial rockiot-dial-' + self.$attrs.size + ' rockiot-dial-' + self.$attrs.serial,
        valueDialClass: 'rockiot-value rockiot-value-' + self.$attrs.size + ' rockiot-value-' + self.$attrs.serial,
        svg: self.svg,
        barColor: self.$attrs.barColor,
        progressColor: self.$attrs.progressColor,
        needleColor: self.$attrs.needleColor,
        scaleColor: self.$attrs.scaleColor
      });
      var svg = document.querySelector('.rockiot-svg-' + this.$attrs.serial);
      svg.setAttribute('ref', 'rockiot-svg-' + this.$attrs.serial);
      this.customize = {
        gauge: document.querySelector('.rockiot-svg-' + this.$attrs.serial),
        dial: document.querySelector('.rockiot-dial-' + this.$attrs.serial),
        value: document.querySelector('.rockiot-value-' + this.$attrs.serial)
      };
      this.customize.dial.style.stroke = this.$attrs.barColor;
      this.customize.value.style.stroke = this.$attrs.progressColor;
    }
  },
  mounted: function mounted() {
    if (this.$attrs.progressColor.split(';').length > 1) {
      this.progressColor = this.$attrs.progressColor.split(';');
    }
    this.createGauge();
    this.setColor();
    this.svg = document.querySelector('.gauge-' + this.$attrs.serial);
    this.svg.hasscale = this.$attrs.scale;
    this.svg.ticks = this.$attrs.ticks;
    this.svg.factor = this.factor;
    this.svg.degree = this.$attrs.degree;
    this.svg.offset = 10;
    this.svg.id = this.$attrs.serial;
    this.svg.W = this.$attrs.svgwidth;
    this.svg.min = this.$attrs.min;
    this.svg.max = this.$attrs.max;
  }
});

/***/ }),

/***/ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.radial.svg.vue?vue&type=template&id=593c1faa":
/*!*****************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/babel-loader/lib??ref--4-0!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/vue-loader/lib??vue-loader-options!./src/components/rockiot.radial.svg.vue?vue&type=template&id=593c1faa ***!
  \*****************************************************************************************************************************************************************************************************************************************/
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
    ref: _vm.$attrs.serial,
    "class": _vm.$attrs.gaugeClass,
    style: 'width:' + _vm.$attrs.svgwidth + 'px;height:' + _vm.$attrs.svgheight + 'px;' + _vm.$attrs.svgStyle,
    attrs: {
      "width": _vm.$attrs.svgwidth,
      "height": _vm.$attrs.svgwidth,
      "id": _vm.$attrs.serial,
      "value": _vm.$attrs.value
    }
  });
};
var staticRenderFns = [];
render._withStripped = true;


/***/ }),

/***/ "./src/components/rockiot.radial.svg.vue":
/*!***********************************************!*\
  !*** ./src/components/rockiot.radial.svg.vue ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _rockiot_radial_svg_vue_vue_type_template_id_593c1faa__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rockiot.radial.svg.vue?vue&type=template&id=593c1faa */ "./src/components/rockiot.radial.svg.vue?vue&type=template&id=593c1faa");
/* harmony import */ var _rockiot_radial_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rockiot.radial.svg.vue?vue&type=script&lang=js */ "./src/components/rockiot.radial.svg.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport *//* harmony import */ var _node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/vue-loader/lib/runtime/componentNormalizer.js */ "./node_modules/vue-loader/lib/runtime/componentNormalizer.js");





/* normalize component */

var component = Object(_node_modules_vue_loader_lib_runtime_componentNormalizer_js__WEBPACK_IMPORTED_MODULE_2__["default"])(
  _rockiot_radial_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_1__["default"],
  _rockiot_radial_svg_vue_vue_type_template_id_593c1faa__WEBPACK_IMPORTED_MODULE_0__["render"],
  _rockiot_radial_svg_vue_vue_type_template_id_593c1faa__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"],
  false,
  null,
  null,
  null
  
)

/* hot reload */
if (false) { var api; }
component.options.__file = "src/components/rockiot.radial.svg.vue"
/* harmony default export */ __webpack_exports__["default"] = (component.exports);

/***/ }),

/***/ "./src/components/rockiot.radial.svg.vue?vue&type=script&lang=js":
/*!***********************************************************************!*\
  !*** ./src/components/rockiot.radial.svg.vue?vue&type=script&lang=js ***!
  \***********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_radial_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/babel-loader/lib??ref--4-0!../../node_modules/vue-loader/lib??vue-loader-options!./rockiot.radial.svg.vue?vue&type=script&lang=js */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.radial.svg.vue?vue&type=script&lang=js");
/* empty/unused harmony star reexport */ /* harmony default export */ __webpack_exports__["default"] = (_node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_radial_svg_vue_vue_type_script_lang_js__WEBPACK_IMPORTED_MODULE_0__["default"]); 

/***/ }),

/***/ "./src/components/rockiot.radial.svg.vue?vue&type=template&id=593c1faa":
/*!*****************************************************************************!*\
  !*** ./src/components/rockiot.radial.svg.vue?vue&type=template&id=593c1faa ***!
  \*****************************************************************************/
/*! exports provided: render, staticRenderFns */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_radial_svg_vue_vue_type_template_id_593c1faa__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! -!../../node_modules/babel-loader/lib??ref--4-0!../../node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!../../node_modules/vue-loader/lib??vue-loader-options!./rockiot.radial.svg.vue?vue&type=template&id=593c1faa */ "./node_modules/babel-loader/lib/index.js?!./node_modules/vue-loader/lib/loaders/templateLoader.js?!./node_modules/vue-loader/lib/index.js?!./src/components/rockiot.radial.svg.vue?vue&type=template&id=593c1faa");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_radial_svg_vue_vue_type_template_id_593c1faa__WEBPACK_IMPORTED_MODULE_0__["render"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "staticRenderFns", function() { return _node_modules_babel_loader_lib_index_js_ref_4_0_node_modules_vue_loader_lib_loaders_templateLoader_js_ref_6_node_modules_vue_loader_lib_index_js_vue_loader_options_rockiot_radial_svg_vue_vue_type_template_id_593c1faa__WEBPACK_IMPORTED_MODULE_0__["staticRenderFns"]; });



/***/ })

}]);