app.config(function($stateProvider) {
  var test = {
    name: "test",
    url: "/test",
    template: "<h3>Test Template</h3>"
  };
  var financialReport = {
    name: "financialReport",
    url: "/financialReport",
    template: "<h3>financialReport</h3>"
  };
  var missionFundState = {
    name: "missionFund",
    url: "/missionFund",
    templateUrl: "views/missionFund.html"
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

  $stateProvider.state(missionFundState);
  $stateProvider.state(aboutState);
  $stateProvider.state(summaryState);
  $stateProvider.state(financialReport);
});
