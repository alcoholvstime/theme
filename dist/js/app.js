'use strict';

(function () {
  var GH_ROOT = 'http://api.github.com';
  var GIST_ENDPOINT = 'gists';

  var graph = {
    getSourceUrls: function getSourceUrls() {
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
    },

    getGistContent: function getGistContent(item) {
      return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.responseType = 'json';
        req.open('GET', GH_ROOT + '/' + GIST_ENDPOINT + '/' + item.src);

        req.onload = function () {
          if (req.status === 200) {
            resolve(req.response);
          } else {
            reject(Error(req.statusText));
          }
        };

        req.onerror = function () {
          reject(Error('Network Error'));
        };

        req.send();
      }).then(function (response) {
        item.data = JSON.parse(response.files[Object.keys(response.files)[0]].content);

        return item;
      });
    },

    getDataFromSrc: function getDataFromSrc(input) {
      var queries = input.map(this.getGistContent);

      return Promise.all(queries);
    }
  };

  window.graph = graph;
})();
//# sourceMappingURL=app.js.map