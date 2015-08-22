'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var graph = (function () {
  function graph() {
    _classCallCheck(this, graph);
  }

  _createClass(graph, null, [{
    key: 'getSourceUrls',
    value: function getSourceUrls() {
      var figElems = document.querySelectorAll('figure');

      var result = [];

      for (var i = 0; i < figElems.length; i++) {
        var data = {
          id: figElems[i].id,
          src: figElems[i].querySelector('img').dataset.src
        };

        result.push(data);
      }

      return result;
    }
  }, {
    key: 'getGistContent',
    value: function getGistContent(item) {
      var GH_ROOT = 'http://api.github.com';
      var GIST_ENDPOINT = 'gists';

      return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.responseType = 'json';
        req.open('GET', GH_ROOT + '/' + GIST_ENDPOINT + '/' + item.src);

        req.onload = function () {
          req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
        };

        req.onerror = function () {
          reject(Error('Network Error'));
        };

        req.send();
      }).then(function (response) {
        return {
          id: item.id,
          data: JSON.parse(response.files[Object.keys(response.files)[0]].content)
        };
      });
    }
  }, {
    key: 'drawChart',
    value: function drawChart(gistData) {
      var GRAPH_MARGIN = {
        top: 10,
        right: 0,
        left: 30,
        bottom: 40
      };

      return gistData.then(function (response) {
        response.data.forEach(function (item) {
          item.data.forEach(function (point, idx) {
            point.idx = idx;
          });
        });

        var xMax = d3.max(response.data, function (item) {
          return item.data.length;
        });
        var yMax = d3.max(response.data, function (item) {
          return d3.max(item.data, function (elem) {
            return elem.value;
          });
        });

        var figElem = document.querySelector('#' + response.id);

        var elemWidth = figElem.offsetWidth;
        var elemHeight = figElem.offsetHeight;

        var figWidth = elemWidth - GRAPH_MARGIN.left - GRAPH_MARGIN.right;
        var figHeight = elemHeight - GRAPH_MARGIN.top - GRAPH_MARGIN.bottom;

        var xScale = d3.scale.linear().range([0, figWidth]).domain([0, xMax - 1]).clamp(true).nice();
        var yScale = d3.scale.linear().range([figHeight, 0]).domain([0, yMax]).clamp(true).nice();

        var xAxis = d3.svg.axis().scale(xScale).tickValues('').orient('bottom');
        var yAxis = d3.svg.axis().scale(yScale).tickValues('').orient('left');

        var line = d3.svg.line().interpolate('monotone').x(function (d) {
          return xScale(d.idx);
        }).y(function (d) {
          return yScale(d.value);
        });

        var plot = d3.select(figElem).append('svg').attr('width', elemWidth).attr('height', elemHeight).append('g').attr('transform', 'translate(' + GRAPH_MARGIN.left + ', ' + GRAPH_MARGIN.top + ')');

        plot.append('g').classed('x axis', true).attr('transform', 'translate(0, ' + figHeight + ')').call(xAxis).append('text').attr('transform', 'translate(' + figWidth + ', -5)').attr('style', 'text-anchor: end').text('Time');

        plot.append('g').classed('y axis', true).call(yAxis).append('text').attr('transform', 'translate(15, 0) rotate(-90)').attr('style', 'text-anchor: end').text('Intensity');

        response.data.forEach(function (item) {
          plot.append('path').classed('line', true).datum(item.data).attr('d', line);
        });
      });
    }
  }]);

  return graph;
})();

;
//# sourceMappingURL=app.js.map