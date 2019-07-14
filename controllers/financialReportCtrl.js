app.controller("financialReportCtrl", function($scope, $http) {
  $scope.buildfinancialSummary = function() {
    var creditReport = {};
    var debitReport = {};
    var transactions = $scope.transactions;
    var totalIgnoredCredit = 0;
    var totalIgnoredDebit = 0;
    for (
      var iTxnIndex = 0;
      iTxnIndex < $scope.transactions.length;
      iTxnIndex++
    ) {
      if (transactions[iTxnIndex].type == "CREDIT") {
        if (transactions[iTxnIndex].ignoreFromFinancialReport !== "YES") {
          totalIgnoredCredit += transactions[iTxnIndex].amount;
        }
        var reason = transactions[iTxnIndex].reason;
        if (
          reason !== undefined &&
          reason !== "PREVIOUS YEAR" &&
          transactions[iTxnIndex].ignoreFromFinancialReport !== "YES"
        ) {
          if (creditReport[reason] == undefined) {
            creditReport[reason] = 0;
          }
          creditReport[reason] += transactions[iTxnIndex].amount;
        }
      } else {
        if (transactions[iTxnIndex].ignoreFromFinancialReport !== "YES") {
          totalIgnoredDebit += transactions[iTxnIndex].amount;
        }
        var reason = transactions[iTxnIndex].reason;
        if (
          reason !== undefined &&
          reason !== "PREVIOUS YEAR" &&
          transactions[iTxnIndex].ignoreFromFinancialReport !== "YES"
        ) {
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
    $scope.totalDebit = $scope.roundToTwo(totalDebit);
    $scope.totalCredit = $scope.roundToTwo(totalCredit);
    var debitOrCredit =
      Object.keys(debitReport).length - Object.keys(creditReport).length;
    if (debitOrCredit > 0) {
      $scope.additionalCreditRows = debitOrCredit;
      $scope.additionalDebitRows = 0;
    } else if (debitOrCredit < 0) {
      $scope.additionalDebitRows = debitOrCredit;
      $scope.additionalCreditRows = 0;
    }
  };
  $scope.roundToTwo = function(num) {
    return +(Math.round(num + "e+2") + "e-2");
  };
  $scope.buildfinancialSummary();
});
