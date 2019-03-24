var app = angular.module("smcFinance", []);

var thePassphrase=""

app.directive('customOnChange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var onChangeFunc = scope.$eval(attrs.customOnChange);
            element.bind('change', onChangeFunc);
        }
    };
});

app.controller("smcFinanceMainCtrl", function ($scope,$http) {
    $scope.mynewVariable="Hi";
    $scope.ejbInputText="helo";
    $scope.transactions = [];
    $scope.showFileSelectionModal=function(){
		$('#myModal').modal('show');

	};
	$scope.showPassPhrasePrompt=function(){
		$('#passwordPromptModal').modal('show');
	}
	$scope.decryptURLsAndGetData=function(){
		
		
		thePassphrase=$scope.passphrase;
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
		handleClientLoad();
	};
	
	$scope.decrypt=function(encryptedMsg,passphrase){
		var encryptedHMAC = encryptedMsg.substring(0, 64);
        var encryptedData = encryptedMsg.substring(64);
        var decryptedHMAC = CryptoJS.HmacSHA256(encryptedData, CryptoJS.SHA256(passphrase).toString()).toString();

        if (decryptedHMAC !== encryptedHMAC) {
            alert('Bad passphrase!');            
        }

        var decryptedString = CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);
		return decryptedString
		
	}
	
	$scope.buttonClicked=function(){
        alert("Name is read as "+$scope.ejbInput.Name);
    };
    $scope.parseExcel = function (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var bstr = e.target.result;
            var workbook = XLSX.read(bstr, { type: 'binary' });
            var cashflow = workbook.Sheets["CashFlow "];
            var tempTransactionObj = {};
            for (var key in cashflow) {
                if (cashflow.hasOwnProperty(key)) {
                    var index = key.substring(1, key.length);
                    if(index=='1'){
                        continue;
                    }
                    
                    var txn = tempTransactionObj[index];
                    if (txn == undefined) {
                        txn = {};
                    }

                    if (key.startsWith("A")) {
                        var val = cashflow[key];
                        txn.date = val.w;
                    }
                    else if (key.startsWith("B")) {
                        var val = cashflow[key];
                        txn.type = val.w;
                    }
                    else if (key.startsWith("C")) {
                        var val = cashflow[key];
                        txn.fromOrTo = val.w;
                    }
                    else if (key.startsWith("D")) {
                        var val = cashflow[key];
                        txn.checkFromOrTo = val.w;
                    }
                    else if (key.startsWith("E")) {
                        var val = cashflow[key];
                        txn.reason = val.w;
                    }
                    else if (key.startsWith("F")) {
                        var val = cashflow[key];
                        txn.amount = parseInt(val.v);
                    }
                    tempTransactionObj[index] = txn;
                }
            }
            $scope.totalCredit=0;
            $scope.totalDebit=0;
            for (var txnIndexkey in tempTransactionObj) {
                if (tempTransactionObj.hasOwnProperty(txnIndexkey)) {
                    $scope.transactions.push(tempTransactionObj[txnIndexkey]);
                    if(tempTransactionObj[txnIndexkey].type=="CREDIT"){
                        $scope.totalCredit=$scope.totalCredit+tempTransactionObj[txnIndexkey].amount;
                    }
                    else if(tempTransactionObj[txnIndexkey].type=="DEBIT"){
                        $scope.totalDebit=$scope.totalDebit+tempTransactionObj[txnIndexkey].amount;
                    }
                }
            }
            //alert($scope.transactions.length);
            $scope.$apply();
        };



        reader.onerror = function (ex) {
            console.log(ex);
        };

        reader.readAsBinaryString(file);
    };

    $scope.uploadFile = function (event) {
        var files = event.target.files;

        // files is a FileList of File objects. List some properties.
        var output = [];
        for (var i = 0, f; f = files[i]; i++) {
            var isXCL = false;
            if (f.name.length > 5) {
                var xlsExtention = f.name.substring(f.name.length - 5, f.name.length);
                if (xlsExtention == '.xlsx') {
                    isXCL = true;
                }
            }
            if (!isXCL) {
                alert('Please load an Excel file');
                continue;
            }
            $scope.parseExcel(f);
        }
    }
});
