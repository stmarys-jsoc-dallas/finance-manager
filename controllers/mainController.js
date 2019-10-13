var app = angular.module("smcFinance", ["ui.router"]);

app.directive("customOnChange", function() {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChange);
      element.bind("change", onChangeFunc);
    }
  };
});
app.controller("mainCtrl", function($rootScope, $scope, $http) {
  $scope.mynewVariable = "Hi";
  $scope.ejbInputText = "helo";
  $rootScope.transactions = [];
  $rootScope.memberDirectory = {};
  $rootScope.receivables = {};
  $scope.showFileSelectionModal = function() {
    $("#myModal").modal("show");
  };
  $scope.showPassPhrasePrompt = function() {
    $("#passwordPromptModal").modal("show");
  };
  $scope.decryptURLsAndGetData = function() {
    thePassphrase = $scope.passphrase;
    //$scope.readFolderURL=$scope.decrypt("c7ee6a277d12716545423ba3ea1ff7e7b31397554b4df16d10261b14a99f247cU2FsdGVkX1/RFG8nnHp3FeAuMoG712au2fho+N5tSsLTbglEQ9t4MeVuY3ATPNX/ZsDnYrykMyjjn5UT2O5DCPeOCb3acDpp0UIZr46Ps3/DB+wc1Pp1WCYV9rBIBbBNcCt43ldg7ZFQF3XAYo1NDoz9Vk7IA5xIdxorNb8jB1EkzxZ6SZzC7TVaA8tm4ekhwRamnqUz9wZll0Hs9R7BRjITV7csgDkTa8WKWPGIipg=",$scope.passphrase)
    //alert($scope.readFolderURL);
    //var driveURL="https://www.googleapis.com/drive/v3/files?q=mimeType+%3D+%27application%2Fvnd.google-apps.folder%27+and+name+contains+%27cashflow%27"
    /*
		$http.get(driveURL)
			.then(function(response) {
			   	alert(JSON.stringify(response));
			},function(json) {
			  	alert("Error! "+JSON.stringify(json));
		});
		*/
    $scope.handleClientLoad();
  };

  $scope.populateData = function() {
    gapi.client.drive.files.list(
      {
        fields: "nextPageToken, files(id, name)",
        pageToken: pageToken
      },
      function(err, res) {
        if (err) {
          // Handle error
          console.error(err);
        } else {
          res.files.forEach(function(file) {
            console.log("Found file: ", file.name, file.id);
          });
          pageToken = res.nextPageToken;
        }
      }
    );
  };

  $scope.decrypt = function(encryptedMsg, passphrase) {
    var encryptedHMAC = encryptedMsg.substring(0, 64);
    var encryptedData = encryptedMsg.substring(64);
    var decryptedHMAC = CryptoJS.HmacSHA256(
      encryptedData,
      CryptoJS.SHA256(passphrase).toString()
    ).toString();

    if (decryptedHMAC !== encryptedHMAC) {
      alert("Bad passphrase!");
    }

    var decryptedString = CryptoJS.AES
      .decrypt(encryptedData, passphrase)
      .toString(CryptoJS.enc.Utf8);
    return decryptedString;
  };

  $scope.buttonClicked = function() {
    alert("Name is read as " + $scope.ejbInput.Name);
  };
  $scope.parseExcel = function(file) {
    var reader = new FileReader();

    reader.onload = function(e) {
      var bstr = e.target.result;
      var workbook = XLSX.read(bstr, { type: "binary" });
      var cashflow = workbook.Sheets["CashFlow "];
      var tempTransactionObj = {};
      for (var key in cashflow) {
        if (cashflow.hasOwnProperty(key)) {
          var index = key.substring(1, key.length);
          if (index == "1") {
            continue;
          }

          var txn = tempTransactionObj[index];
          if (txn == undefined) {
            txn = {};
          }

          if (key.startsWith("A")) {
            var val = cashflow[key];
            txn.date = val.w;
          } else if (key.startsWith("B")) {
            var val = cashflow[key];
            txn.type = val.w;
          } else if (key.startsWith("C")) {
            var val = cashflow[key];
            txn.fromOrTo = val.w;
          } else if (key.startsWith("D")) {
            var val = cashflow[key];
            txn.subReason = val.w;
          } else if (key.startsWith("E")) {
            var val = cashflow[key];
            txn.reason = val.w;
          } else if (key.startsWith("F")) {
            var val = cashflow[key];
            txn.amount = parseFloat(val.v);
          } else if (key.startsWith("G")) {
            var val = cashflow[key];
            txn.isMember = val.w;
          } else if (key.startsWith("H")) {
            var val = cashflow[key];
            txn.bankCleared = val.w;
          } else if (key.startsWith("I")) {
            var val = cashflow[key];
            txn.bankClearedDate = val.w;
          } else if (key.startsWith("J")) {
            var val = cashflow[key];
            txn.modeOfTxn = val.w;
          } else if (key.startsWith("L")) {
            var val = cashflow[key];
            txn.ignoreFromFinancialReport = val.w;
          }
          tempTransactionObj[index] = txn;
        }
      }
      $scope.totalCredit = 0;
      $scope.totalDebit = 0;
      for (var txnIndexkey in tempTransactionObj) {
        if (tempTransactionObj.hasOwnProperty(txnIndexkey)) {
          $scope.transactions.push(tempTransactionObj[txnIndexkey]);
          if (tempTransactionObj[txnIndexkey].type == "CREDIT") {
            $scope.totalCredit =
              $scope.totalCredit + tempTransactionObj[txnIndexkey].amount;
          } else if (tempTransactionObj[txnIndexkey].type == "DEBIT") {
            $scope.totalDebit =
              $scope.totalDebit + tempTransactionObj[txnIndexkey].amount;
          }
        }
      }
      loadMemberDirectory(workbook);
      loadReceivables(workbook);
      $scope.$apply();
    };

    reader.onerror = function(ex) {
      console.log(ex);
    };

    reader.readAsBinaryString(file);
  };

  loadMemberDirectory = function(workbook) {
    var memberDirectory = workbook.Sheets["Member Directory"];
    var memberDetails = [];
    for (var key in memberDirectory) {
      if (memberDirectory.hasOwnProperty(key)) {
        var index = key.substring(1, key.length);
        if (index == "1") {
          continue;
        }

        var member = memberDetails[index - 1];
        if (member == undefined) {
          member = {};
        }

        if (key.startsWith("B")) {
          var val = memberDirectory[key];
          member.name = val.w;
        } else if (key.startsWith("E")) {
          var val = memberDirectory[key];
          member.email = val.w;
        }
        memberDetails[index - 1] = member;
      }
    }

    $rootScope.memberDirectory = {};
    for (
      var memberIndex = 0;
      memberIndex < memberDetails.length;
      memberIndex++
    ) {
      if (memberDetails[memberIndex] != undefined) {
        $rootScope.memberDirectory[memberDetails[memberIndex].name] = {
          email: memberDetails[memberIndex].email
        };
      }
    }
  };

  loadReceivables = function(workbook) {
    var receivables = workbook.Sheets["Receivables"];
    var receivableArray = [];
    for (var key in receivables) {
      if (receivables.hasOwnProperty(key)) {
        var index = key.substring(1, key.length);
        if (index == "1") {
          continue;
        }

        var receivableEntry = receivableArray[index - 1];
        if (receivableEntry == undefined) {
          receivableEntry = {};
        }

        if (key.startsWith("A")) {
          var val = receivables[key];
          receivableEntry.name = val.w;
        } else if (key.startsWith("B")) {
          var val = receivables[key];
          receivableEntry.category = val.w;
        } else if (key.startsWith("D")) {
          var val = receivables[key];
          receivableEntry.amountPaid = parseFloat(val.v);
        } else if (key.startsWith("E")) {
          var val = receivables[key];
          receivableEntry.amountPending = parseFloat(val.v);
        }
        receivableArray[index - 1] = receivableEntry;
      }
    }

    $rootScope.receivables = {};
    for (
      let receievableArrayIndex = 0;
      receievableArrayIndex < receivableArray.length;
      receievableArrayIndex++
    ) {
      if (
        receivableArray[receievableArrayIndex] != undefined &&
        receivableArray[receievableArrayIndex].amountPending > 0
      ) {
        var memberName = receivableArray[receievableArrayIndex].name;
        if ($rootScope.receivables[memberName] === undefined) {
          $rootScope.receivables[memberName] = {};
          $rootScope.receivables[memberName].dues = [];
          $rootScope.receivables[memberName].collectibles = [];
        }
        if (
          receivableArray[receievableArrayIndex].category.startsWith(
            "Subscription"
          )
        ) {
          $rootScope.receivables[memberName].dues.push(
            receivableArray[receievableArrayIndex]
          );
        } else {
          $rootScope.receivables[memberName].collectibles.push(
            receivableArray[receievableArrayIndex]
          );
        }
      }
    }
  };

  $scope.uploadFile = function(event) {
    var files = event.target.files;

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; (f = files[i]); i++) {
      var isXCL = false;
      if (f.name.length > 5) {
        var xlsExtention = f.name.substring(f.name.length - 5, f.name.length);
        if (xlsExtention == ".xlsx") {
          isXCL = true;
        }
      }
      if (!isXCL) {
        alert("Please load an Excel file");
        continue;
      }
      $scope.parseExcel(f);
    }
  };

  $scope.getFileDetails = function(fileId) {
    var request = gapi.client.drive.files.get({
      fileId: fileId
    });
    request.execute(function(resp) {
      console.log(JSON.stringify(resp));
    });
  };

  $scope.listFiles = function() {
    gapi.client.drive.files
      .list({
        pageSize: 10,
        q: "mimeType='application/vnd.google-apps.folder'",
        fields: "nextPageToken, files(id, name,mimeType)"
      })
      .then(function(response) {
        //console.log("Files:");
        var files = response.result.files;
        if (files && files.length > 0) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            console.log("Found file " + file.name);
            if (
              file.mimeType == "application/vnd.google-apps.folder" &&
              file.name != undefined &&
              file.name.toLowerCase().startsWith("cashflow")
            ) {
              console.log("Found a cashflow folder " + file.name);
              if ($scope.availableDataYearsInfo == undefined) {
                $scope.availableDataYearsInfo = [];
              }
              var yearInfo = {};
              yearInfo.folderName = file.name;
              yearInfo.folderID = file.id;

              $scope.availableDataYearsInfo.push(yearInfo);
              //$scope.listFilesInFolder(file.id);
            }
            $scope.$apply();
            //$scope.getFileDetails(file.id);
          }
        } else {
          console.log("No files found.");
        }
      });
  };

  $scope.listFilesInFolder = function(folderID) {
    console.log("Trying to find files in folder " + folderID);
    gapi.client.drive.files
      .list({
        q: "'" + folderID + "' in parents",
        fields:
          "nextPageToken, files(id, name,mimeType,webContentLink,webViewLink)"
      })
      .then(function(response) {
        var files = response.result.files;
        $scope.cashFlowFiles = [];
        if (files && files.length > 0) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            console.log("Found file " + file.name + " in folder " + folderID);
            if (file.name.endsWith(".xlsx")) {
              console.log(
                file.name +
                  " identified as Cashflow Excel. Details ->" +
                  JSON.stringify(file)
              );
              var cashflowExcel = {};
              cashflowExcel.fileName = file.name;
              cashflowExcel.fileID = file.id;
              $scope.cashFlowFiles.push(cashflowExcel);
            }
          }
          $scope.$apply();
        } else {
          console.log("No files found.");
        }
      });
  };

  $scope.GoogleAuth;
  $scope.SCOPE =
    "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";
  $scope.handleClientLoad = function() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load("client:auth2", $scope.initGmail);
  };
  $scope.initGmail = function() {
    gapi.client.load("gmail", "v1", $scope.initClient);
  };

  $scope.initClient = function() {
    // Retrieve the discovery document for version 3 of Google Drive API.
    // In practice, your app can retrieve one or more discovery documents.
    var discoveryUrl =
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    var passphrase = $("#passphrase").val();
    $scope.passphrase = passphrase;

    var clientID = $scope.decrypt(
      "1a1ebc396119f653560c87ecc3b1d7aaa423b756bcf3ccc7d0bd905b47588853U2FsdGVkX19bHralZOdKu6SEiNkAd+a5+2qESy9s10AjVqpb+iXfaKwc9rkgybEckyY7vtJriGOnTO9onxKkX71g1fhPSooz06KWOGcrfMeR/VcfUiAGZUCjmuRl8rFP",
      thePassphrase
    );

    var apiKey = $scope.decrypt(
      "3f77ab07cccd066e34749a0a27c7d834059ca283262561272eb4e45dbf1277bcU2FsdGVkX1+wp0SQoGuavsVsZJixXlJnuBSQt2V2qEUDWJTivNW3ntnYkLq1KATiFrdyqiQ0Wiqjrg5EXLw/Zw==",
      thePassphrase
    );

    gapi.client
      .init({
        apiKey: apiKey,
        discoveryDocs: [discoveryUrl],
        clientId: clientID,
        scope: $scope.SCOPE
      })
      .then(function() {
        $scope.GoogleAuth = gapi.auth2.getAuthInstance();
        // Listen for sign-in state changes.
        $scope.GoogleAuth.isSignedIn.listen($scope.updateSigninStatus);
        // Handle initial sign-in state. (Determine if user is already signed in.)
        var user = $scope.GoogleAuth.currentUser.get();
        $scope.setSigninStatus();
        // Call handleAuthClick function when user clicks on
        //      "Sign In/Authorize" button.
        $("#sign-in-or-out-button").click(function() {
          $scope.handleAuthClick();
        });
        $("#revoke-access-button").click(function() {
          $scope.revokeAccess();
        });
      });
  };
  $scope.handleAuthClick = function() {
    if ($scope.GoogleAuth.isSignedIn.get()) {
      // User is authorized and has clicked 'Sign out' button.
      $scope.GoogleAuth.signOut();
    } else {
      // User is not signed in. Start Google auth flow.
      $scope.GoogleAuth.signIn();
    }
  };
  $scope.revokeAccess = function() {
    $scope.GoogleAuth.disconnect();
  };
  $scope.setSigninStatus = function(isSignedIn) {
    var user = $scope.GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes($scope.SCOPE);
    if (isAuthorized) {
      $scope.listFiles();
      $("#sign-in-or-out-button").html("Sign out");
      $("#revoke-access-button").css("display", "inline-block");
      $("#auth-status").html(
        "You are currently signed in and have granted " + "access to this app."
      );
    } else {
      $scope.handleAuthClick();
      $("#sign-in-or-out-button").html("Sign In/Authorize");
      $("#revoke-access-button").css("display", "none");
      $("#auth-status").html(
        "You have not authorized this app or you are " + "signed out."
      );
    }
  };
  $scope.updateSigninStatus = function(isSignedIn) {
    $scope.setSigninStatus();
  };

  $scope.callGoogleApi = function() {
    var request = gapi.client.drive.about.get({ fields: "user" });

    // Execute the API request.
    request.execute(function(response) {
      console.log(response);
    });
  };

  $scope.populateData = function() {
    console.log("In File search method");
    var pageToken = null;
    try {
      gapi.client.drive.files.list(
        {
          q: "mimeType='image/jpeg'",
          fields: "nextPageToken, files(id, name)",
          spaces: "drive",
          pageToken: pageToken
        },
        function(err, res) {
          if (err) {
            // Handle error
            console.error(err);
          } else {
            console.log("Got response for file lookup");
            res.files.forEach(function(file) {
              console.log("Found file: ", file.name, file.id);
            });
            pageToken = res.nextPageToken;
          }
        }
      );
    } catch (error) {
      console.error(err);
    }
  };

  $scope.loadExcelFromGDrive = function(gDriveFileID) {
    gDriveFileID = e.target.value;
    alert(gDriveFileID);
    var accessToken = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse().access_token; // or this: gapi.auth.getToken().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      "https://www.googleapis.com/drive/v3/files/" +
        gDriveFileID +
        "?alt=media",
      true
    );
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
    xhr.responseType = "blob";
    xhr.onload = function() {
      alert("Got response");
      $scope.parseExcel(xhr.response);
    };
    xhr.send();
  };
  $scope.toggleButtonClick = function(clickedButton) {
    $scope.clickedButton = clickedButton;
  };
});
