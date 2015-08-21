(() => {
  const GH_ROOT = 'http://api.github.com';
  const GIST_ENDPOINT = 'gists';

  let graph = {
    getSourceUrls() {
      let figElems = document.querySelectorAll('figure');

      let result = [];

      for (let i = 0; i < figElems.length; i++) {
        let data = {
          id: figElems[i].id,
          src: figElems[i].querySelector('img').dataset.src,
        };

        result.push(data);
      }

      return result;
    },

    getGistContent(item) {
      return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.responseType = 'json';
        req.open('GET', `${GH_ROOT}/${GIST_ENDPOINT}/${item.src}`);

        req.onload = () => {
          if (req.status === 200) {
            resolve(req.response);
          } else {
            reject(Error(req.statusText));
          }
        };

        req.onerror = () => {
          reject(Error('Network Error'));
        };

        req.send();
      }).then((response) => {
        item.data = JSON.parse(response.files[Object.keys(response.files)[0]].content);

        return item;
      });
    },

    getDataFromSrc(input) {
      let queries = input.map(this.getGistContent);

      return Promise.all(queries);
    },
  };

  // Inject the function into the browser global namespace
  window.graph = graph;
})();
