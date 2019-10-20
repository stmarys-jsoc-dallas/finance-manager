app.controller("emailMembersCtrl", function($scope, $rootScope, $http) {
  $scope.memberDetails = {};
  $scope.emailSubject = "Financial Contributions Update";
  $scope.emailCCList = "glabi2001@gmail.com,";
  $scope.year = new Date().getFullYear();
  $scope.validationList = [];
  $scope.showValidationList = false;
  $scope.showDetailsForAll = false;
  $scope.voluntaryContributions = [
    { category: "Perunnal Share", suggestedAmount: "-" },
    { category: "Onam Lunch", suggestedAmount: "25" }
  ];
  $scope.formLoad = function() {
    $scope.calculateEmailData();
  };

  $scope.calculateEmailData = function() {
    $scope.memberDetails = {};
    var year2Digit = "";
    if ($scope.year !== undefined && $scope.year.length == 4) {
      year2Digit = $scope.year.substring(2, 4);
    }

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
        if (
          $scope.memberDirectory[transaction.fromOrTo] !== undefined &&
          transaction.date.endsWith(year2Digit) &&
          transaction.ignoreFromFinancialReport !== "YES"
        ) {
          if (transaction.isMember === "YES") {
            //alert(JSON.stringify(transaction));
            let memberDetail = memberDetails[transaction.fromOrTo];
            if (memberDetail === undefined) {
              memberDetail = {};
              memberDetail.show = false;
            }
            if (memberDetail.credits == undefined) {
              memberDetail.credits = [];
            }
            memberDetail.credits.push(transaction);

            memberDetails[transaction.fromOrTo] = memberDetail;
          } else {
            $scope.validationList.push(transaction);
          }
        }
      }
    }
    $scope.memberDetails = memberDetails;
    for (var key in $scope.memberDirectory) {
      if ($scope.memberDirectory.hasOwnProperty(key)) {
        if ($scope.memberDetails[key] === undefined) {
          $scope.memberDetails[key] = {};
        }
        $scope.memberDetails[key].show = false;
        if ($rootScope.receivables[key] != undefined) {
          $scope.memberDetails[key].dues = $rootScope.receivables[key].dues;
          $scope.memberDetails[key].collectibles =
            $rootScope.receivables[key].collectibles;
        }
        if ($scope.memberDetails[key].credits != undefined) {
          for (var voluntaryItem in $scope.voluntaryContributions) {
            let matchFound = false;
            for (var credit in $scope.memberDetails[key].credits) {
              if (
                $scope.voluntaryContributions[voluntaryItem].category ===
                $scope.memberDetails[key].credits[credit].reason
              ) {
                matchFound = true;
              }
            }
            if (!matchFound) {
              if (
                $scope.memberDetails[key].voluntaryContributions === undefined
              ) {
                $scope.memberDetails[key].voluntaryContributions = [];
              }

              $scope.memberDetails[key].voluntaryContributions.push(
                $scope.voluntaryContributions[voluntaryItem]
              );
            }
          }
        }

        $scope.memberDetails[key].contact = $scope.memberDirectory[key];
      }
    }
    $scope.memberCount = Object.keys($scope.memberDetails).length;
  };
  $scope.sendEmailtoMembers = function() {
    for (let member in $scope.memberDetails) {
      let memberDataDiv = document.getElementById(member);
      let elementsToHide = memberDataDiv.getElementsByClassName("ng-hide");
      if (elementsToHide != undefined) {
        for (let i = 0; i < elementsToHide.length; i++) {
          elementsToHide[i].remove();
        }
      }
      let emailContent = memberDataDiv.outerHTML;
      if (
        $scope.memberDetails[member].contact !== undefined &&
        $scope.memberDetails[member].contact.email !== undefined
      ) {
        let headers_obj = {
          To: "eldhose.jacob@live.com",
          Cc: "secretary@stmarys-jsoc-dallas.org," + $scope.emailCCList,
          Subject: $scope.emailSubject,
          "Content-Type": "text/html; charset=UTF-8"
        };

        $scope.sendEmail(headers_obj, emailContent, () => {
          $scope.memberDetails[member].emailSent = true;
          $scope.apply();
        });
      }
      break;
    }
  };
  $scope.sendEmail = function(headers_obj, message, callback) {
    var email = "";

    for (var header in headers_obj)
      email += header += ": " + headers_obj[header] + "\r\n";

    email += "\r\n" + message;

    var sendRequest = gapi.client.gmail.users.messages.send({
      userId: "me",
      resource: {
        raw: window
          .btoa(email)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
      }
    });

    return sendRequest.execute(callback);
  };
  $scope.calculateEmailData();
});
