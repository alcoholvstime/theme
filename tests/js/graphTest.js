(function() {
  var urls = graph.getSourceUrls();

  urls.forEach(function(item) {
    var gistData = graph.getGistContent(item);
    graph.drawChart(gistData);
  });
})();
