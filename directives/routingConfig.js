app.config(function($stateProvider) {
  var helloState = {
    name: "hello",
    url: "/hello",
    template: "<h3>hello world!</h3>"
  };

  var aboutState = {
    name: "about",
    url: "/about",
    templateUrl: "views/hello.html",
    controller: ""
  };

  $stateProvider.state(helloState);
  $stateProvider.state(aboutState);
});
