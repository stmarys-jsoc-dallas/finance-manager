app.config(function($stateProvider) {
  var test = {
    name: "test",
    url: "/test",
    template: "<h3>Test Template</h3>"
  };
  var financialReport = {
    name: "financialReport",
    url: "/financialReport",
    templateUrl: "views/financialReport.html"
  };
  var missionFundState = {
    name: "missionFund",
    url: "/missionFund",
    templateUrl: "views/missionFund.html"
  };
  var emailMembers = {
    name: "emailMembers",
    url: "/emailMembers",
    templateUrl: "views/emailMembers.html"
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
  $stateProvider.state(emailMembers);
});
