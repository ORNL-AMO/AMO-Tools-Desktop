/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
// This file includes polyfills needed by Angular and is loaded before
// the app. You can add your own extra polyfills to this file.
import 'core-js/es/symbol';
import 'core-js/es/object';
import 'core-js/es/function';
import 'core-js/es/parse-int';
import 'core-js/es/parse-float';
import 'core-js/es/number';
import 'core-js/es/math';
import 'core-js/es/string';
import 'core-js/es/date';
import 'core-js/es/array';
import 'core-js/es/regexp';
import 'core-js/es/map';
import 'core-js/es/set';
import 'core-js/es/reflect';
import './zone-flags';
import 'zone.js/dist/zone';

// Expose global for use by third party libs
(window as any).global = window;
