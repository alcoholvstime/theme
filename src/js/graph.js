class graph {
  static getSourceUrls() {
    let figElems = document.querySelectorAll('figure');

    let result = [];

    for (let i = 0; i < figElems.length; i++) {
      let data = {
        id: figElems[i].id,
        src: figElems[i].querySelector('img')
          .dataset.src,
      };

      result.push(data);
    }

    return result;
  }

  static getGistContent(item) {
    const GH_ROOT = 'http://api.github.com';
    const GIST_ENDPOINT = 'gists';

    return new Promise((resolve, reject) => {
      let req = new XMLHttpRequest();
      req.responseType = 'json';
      req.open('GET', `${GH_ROOT}/${GIST_ENDPOINT}/${item.src}`);

      req.onload = () => {
        req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
      };

      req.onerror = () => {
        reject(Error('Network Error'));
      };

      req.send();
    }).then((response) => {
      return {
        id: item.id,
        data: JSON.parse(response.files[Object.keys(response.files)[0]].content),
      };
    });
  }

  static drawChart(gistData) {
    const GRAPH_MARGIN = {
      top: 10,
      right: 0,
      left: 30,
      bottom: 40,
    };

    return gistData.then((response) => {
      response.data.forEach((item) => {
        item.data.forEach((point, idx) => {
          point.idx = idx;
        });
      });

      let xMax = d3.max(response.data, (item) => { return item.data.length; });
      let yMax = d3.max(response.data, (item) => { return d3.max(item.data, (elem) => { return elem.value; }); });

      let figElem = document.querySelector(`#${response.id}`);

      let elemWidth = figElem.offsetWidth;
      let elemHeight = figElem.offsetHeight;

      let figWidth = elemWidth - GRAPH_MARGIN.left - GRAPH_MARGIN.right;
      let figHeight = elemHeight - GRAPH_MARGIN.top - GRAPH_MARGIN.bottom;

      let xScale = d3.scale.linear()
        .range([0, figWidth])
        .domain([0, xMax - 1])
        .clamp(true)
        .nice();
      let yScale = d3.scale.linear()
        .range([figHeight, 0])
        .domain([0, yMax])
        .clamp(true)
        .nice();

      let xAxis = d3.svg.axis()
        .scale(xScale)
        .tickValues('')
        .orient('bottom');
      let yAxis = d3.svg.axis()
        .scale(yScale)
        .tickValues('')
        .orient('left');

      let line = d3.svg.line()
        .interpolate('monotone')
        .x((d) => {
          return xScale(d.idx);
        })
        .y((d) => {
          return yScale(d.value);
        });

      let plot = d3.select(figElem)
        .append('svg')
        .attr('width', elemWidth)
        .attr('height', elemHeight)
        .append('g')
        .attr('transform', `translate(${GRAPH_MARGIN.left}, ${GRAPH_MARGIN.top})`);

      plot.append('g')
        .classed('x axis', true)
        .attr('transform', `translate(0, ${figHeight})`)
        .call(xAxis)
        .append('text')
        .attr('transform', `translate(${figWidth}, -5)`)
        .attr('style', 'text-anchor: end')
        .text('Time');

      plot.append('g')
        .classed('y axis', true)
        .call(yAxis)
        .append('text')
        .attr('transform', 'translate(15, 0) rotate(-90)')
        .attr('style', 'text-anchor: end')
        .text('Intensity');

      response.data.forEach((item) => {
        plot.append('path')
          .classed('line', true)
          .datum(item.data)
          .attr('d', line);
      });
    });
  }
};
