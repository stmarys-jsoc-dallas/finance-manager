app.controller("emailMembersCtrl", function($scope, $rootScope, $http) {
  $scope.emailContent = "";
  $scope.memberDetails = {};
  $scope.duesAndDonationsOrReceipts = "DuesAndDonations";
  $scope.emailIntroText = "";
  $scope.emailSubject = "Financial Contributions Update";
  $scope.emailCCList = "glabi2001@gmail.com,";
  $scope.year = new Date().getFullYear();
  $scope.validationList = [];
  $scope.showValidationList = false;
  $scope.showDetailsForAll = false;
  $scope.voluntaryContributions = [
    { category: "Perunnal Share", suggestedAmount: "-" },
    { category: "Mission Fund", suggestedAmount: "-" },
    { category: "Onam Lunch", suggestedAmount: "25" }
  ];
  $scope.formLoad = function() {
    $scope.calculateEmailData();
  };

  $scope.switchMode = function(newMode) {
    $scope.duesAndDonationsOrReceipts = newMode;
    if (newMode === "DuesAndDonations") {
      $scope.emailIntroText =
        "Below is the information regarding the payments you have done to our Church till today for year" +
        $scope.year;
    } else {
      $scope.emailIntroText =
        "Below is the summary of donations you have done to our church for year " +
        $scope.year;
    }
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
            if (memberDetail.creditSummary == undefined) {
              memberDetail.creditSummary = {};
            }
            let amountForCategory =
              memberDetail.creditSummary[transaction.reason];
            if (amountForCategory == undefined) {
              amountForCategory = 0;
            }
            if (memberDetail.creditSummaryTotal === undefined) {
              memberDetail.creditSummaryTotal = 0;
            }
            memberDetail.creditSummaryTotal += transaction.amount;
            memberDetail.creditSummary[transaction.reason] =
              amountForCategory + transaction.amount;
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
        //alert(JSON.stringify($scope.memberDetails[key].creditSummary));
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
          To: $scope.memberDetails[member].contact.email,
          Cc: "secretary@stmarys-jsoc-dallas.org," + $scope.emailCCList,
          Subject: $scope.emailSubject,
          "Content-Type": "text/html; charset=UTF-8"
        };
        if ($scope.memberDetails[member].needToSendEmail) {
          alert(emailContent);
          $scope.sendEmail(headers_obj, emailContent, response => {
            console.log(
              "Response for" + member + " is " + JSON.stringify(response)
            );
            $scope.$applyAsync();
            $scope.memberDetails[member].emailSent = true;
          });
        }
      }
    }
  };
  $scope.showEmailContentForMember = function(memberName) {
    let memberDataDiv = document.getElementById(memberName);
    let elementsToHide = memberDataDiv.getElementsByClassName("ng-hide");
    if (elementsToHide != undefined) {
      for (let i = 0; i < elementsToHide.length; i++) {
        elementsToHide[i].remove();
      }
    }
    let emailContent = memberDataDiv.outerHTML;
    emailContent = emailContent.replace("ng-hide", "");
    $scope.emailContent = emailContent;
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
  $scope.selectAllForEmail = function() {
    for (let member in $scope.memberDetails) {
      $scope.memberDetails[member].needToSendEmail = true;
    }
  };
  $scope.unSelectAllForEmail = function() {
    for (let member in $scope.memberDetails) {
      $scope.memberDetails[member].needToSendEmail = false;
    }
  };
  $scope.addVoluntaryContribution = function(index) {
    $scope.voluntaryContributions.splice(index, 0, {
      category: "",
      suggestedAmount: "-"
    });
  };
  $scope.removeVoluntaryContribution = function(index) {
    if ($scope.voluntaryContributions.length > 1) {
      $scope.voluntaryContributions.splice(index, 1);
    } else if ($scope.voluntaryContributions.length == 1) {
      $scope.voluntaryContributions[0] = {
        category: "",
        suggestedAmount: "-"
      };
    }
  };
  $scope.calculateEmailData();
});
