/*
  Copyright 2017 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

/* jshint node: true */
'use strict';
var path = require('path');
var stringReplace = require('broccoli-string-replace');

module.exports = {
  name: 'ember-esri-loader',

  postprocessTree: function (type, tree) {
    if (type !== 'all')
      return tree;

    var outputPaths = this.app.options.outputPaths;

    // Create the string replace patterns for the various application files
    // We will replace require and define function call by their pig-latin version
    var data = {
      files: [
        new RegExp(path.parse(outputPaths.app.js).name + '(.*js)'),
        new RegExp(path.parse(outputPaths.vendor.js).name + '(.*js)'),
        new RegExp(path.parse(outputPaths.tests.js).name + '(.*js)'),
        new RegExp(path.parse(outputPaths.testSupport.js.testSupport).name + '(.*js)')
      ],
      patterns: [{
        match: /([^A-Za-z0-9_#]|^|["])define(\W|["]|$)/g,
        replacement: '$1efineday$2'
      }, {
        match: /(\W|^|["])require(\W|["]|$)/g,
        replacement: '$1equireray$2'
      }, {
        // TODO: probably a better way to achieve this, but for now
        // we use a special token "__dojoRequire" for the places in the
        // esri-loader service where we want to allow nested require statements
        // and this regExp will replace that token with calls to require()
        match: /(\W|^|["])__dojoRequire(\W|["]|$)/g,
        replacement: '$1require$2'
      }]
    };
    var dataTree = stringReplace(tree, data);

    // Special case for the test loader that is doing some funky stuff with require
    // We basically decided to pig latin all require cases.
    var testLoader = {
      files: [
        new RegExp(path.parse(outputPaths.testSupport.js.testLoader).name + '(.*js)')
      ],
      patterns: [{
        match: /(\W|^|["])define(\W|["]|$)/g,
        replacement: '$1efineday$2'
      }, {
        match: /require([.])/g,
        replacement: 'equireray.'
      }, {
        match: /require([(])/g,
        replacement: 'equireray('
      }, {
        match: /require([ ])/g,
        replacement: 'equireray '
      }, {
        match: /requirejs([.])/g,
        replacement: 'equireray.'
      }]
    };

    return stringReplace(dataTree, testLoader);
  }
};
