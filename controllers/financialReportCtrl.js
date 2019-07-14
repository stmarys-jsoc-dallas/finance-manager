app.controller("financialReportCtrl", function($scope, $http) {
  $scope.buildfinancialSummary = function() {
    var creditReport = {};
    var debitReport = {};
    var transactions = $scope.transactions;
    for (
      var iTxnIndex = 0;
      iTxnIndex < $scope.transactions.length;
      iTxnIndex++
    ) {
      if (transactions[iTxnIndex].type == "CREDIT") {
        var reason = transactions[iTxnIndex].reason;
        if (reason != undefined) {
          if (creditReport[reason] == undefined) {
            creditReport[reason] = 0;
          }
          creditReport[reason] += transactions[iTxnIndex].amount;
        }
      } else {
        var reason = transactions[iTxnIndex].reason;
        if (reason != undefined) {
          if (debitReport[reason] == undefined) {
            debitReport[reason] = 0;
          }
          debitReport[reason] += transactions[iTxnIndex].amount;
        }
      }
    }
    var totalCredit = 0;
    for (var creditItem in creditReport) {
      if (creditReport.hasOwnProperty(creditItem)) {
        totalCredit += creditReport[creditItem];
      }
    }

    var totalDebit = 0;
    for (var debitItem in debitReport) {
      if (debitReport.hasOwnProperty(debitItem)) {
        totalDebit += debitReport[debitItem];
      }
    }
    $scope.creditReport = creditReport;
    $scope.debitReport = debitReport;
    $scope.totalDebit = totalDebit;
    $scope.totalCredit = totalCredit;
  };
  $scope.buildfinancialSummary();
});
