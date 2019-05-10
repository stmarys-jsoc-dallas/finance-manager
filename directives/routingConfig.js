app.config(function($stateProvider) {
  var helloState = {
    name: "hello",
    url: "/hello",
    template: "<h3>hello world!</h3>"
  };

  var aboutState = {
    name: "about",
    url: "/about",
    templateUrl: "views/hello.html"
  };

  var summaryState = {
    name: "summary",
    url: "/summary",
    templateUrl: "views/summary.html"
  };

  $stateProvider.state(helloState);
  $stateProvider.state(aboutState);
  $stateProvider.state(summaryState);
});
