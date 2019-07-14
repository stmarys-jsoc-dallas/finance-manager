app.controller("financialReportCtrl", function($scope, $http) {
  $scope.buildfinancialSummary = function() {
    var creditReport = {};
    var debitReport = {};
    for (var iTxnIndex = 0; i < transactions.length; iTxnIndex++) {
      if (transactions[iTxnIndex].type == "CREDIT") {
        var reason = transactions[iTxnIndex].reason;
        if (creditReport[reason] == undefined) {
          creditReport[reason] = 0;
        }
        creditReport[reason] += transactions[iTxnIndex].amount;
      } else {
        var reason = transactions[iTxnIndex].reason;
        if (debitReport[reason] == undefined) {
          debitReport[reason] = 0;
        }
        debitReport[reason] += transactions[iTxnIndex].amount;
      }
    }
    $scope.creditReport = creditReport;
    $scope.debitReport = debitReport;
  };
  $scope.buildfinancialSummary();
});
