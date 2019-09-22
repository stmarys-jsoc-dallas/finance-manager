app.controller("emailMembersCtrl", function($scope, $http) {
  $scope.calculateEmailData = function() {
    let memberDetails = $scope.memberDetails;
    if (memberDetails === undefined) {
      memberDetails = {};
    }
    var transactions = $scope.transactions;
    for (
      var iTxnIndex = 0;
      iTxnIndex < $scope.transactions.length;
      iTxnIndex++
    ) {
      let transaction = $scope.transactions[iTxnIndex];
      if (transaction.type === "CREDIT") {
        let memberDetail = memberDetails[transaction.fromOrTo];
        if (memberDetail === undefined) {
          memberDetail = {};
        }
        if (memberDetail.credits == undefined) {
          memberDetail.credits = {};
        }
        memberDetail.credits.push(transaction);

        memberDetails[transaction.fromOrTo] = memberDetail;
      }
    }
    $scope.memberDetails = memberDetails;
  };
});
