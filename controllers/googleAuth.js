var GoogleAuth;
var SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.readonly';
function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient);
}

var decrypt = function (encryptedMsg, passphrase) {
    var encryptedHMAC = encryptedMsg.substring(0, 64);
    var encryptedData = encryptedMsg.substring(64);
    var decryptedHMAC = CryptoJS.HmacSHA256(encryptedData, CryptoJS.SHA256(passphrase).toString()).toString();
    if (decryptedHMAC !== encryptedHMAC) {
        alert('Bad passphrase!');
    }
    var decryptedString = CryptoJS.AES.decrypt(encryptedData, passphrase).toString(CryptoJS.enc.Utf8);
    return decryptedString

}
function initClient() {
    // Retrieve the discovery document for version 3 of Google Drive API.
    // In practice, your app can retrieve one or more discovery documents.
    var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    var passphrase = $('#passphrase').val();

    var clientID = decrypt("1a1ebc396119f653560c87ecc3b1d7aaa423b756bcf3ccc7d0bd905b47588853U2FsdGVkX19bHralZOdKu6SEiNkAd+a5+2qESy9s10AjVqpb+iXfaKwc9rkgybEckyY7vtJriGOnTO9onxKkX71g1fhPSooz06KWOGcrfMeR/VcfUiAGZUCjmuRl8rFP", thePassphrase);

    var apiKey = decrypt("3f77ab07cccd066e34749a0a27c7d834059ca283262561272eb4e45dbf1277bcU2FsdGVkX1+wp0SQoGuavsVsZJixXlJnuBSQt2V2qEUDWJTivNW3ntnYkLq1KATiFrdyqiQ0Wiqjrg5EXLw/Zw==", thePassphrase);

    gapi.client.init({
        'apiKey': apiKey,
        'discoveryDocs': [discoveryUrl],
        'clientId': clientID,
        'scope': SCOPE
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();
        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(updateSigninStatus);
        // Handle initial sign-in state. (Determine if user is already signed in.)
        var user = GoogleAuth.currentUser.get();
        setSigninStatus();
        // Call handleAuthClick function when user clicks on
        //      "Sign In/Authorize" button.
        $('#sign-in-or-out-button').click(function () {
            handleAuthClick();
        });
        $('#revoke-access-button').click(function () {
            revokeAccess();
        });
    });
}
function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked 'Sign out' button.
        GoogleAuth.signOut();
    } else {
        // User is not signed in. Start Google auth flow.
        GoogleAuth.signIn();
    }
}
function revokeAccess() {
    GoogleAuth.disconnect();
}
function setSigninStatus(isSignedIn) {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
        listFiles();
        $('#sign-in-or-out-button').html('Sign out');
        $('#revoke-access-button').css('display', 'inline-block');
        $('#auth-status').html('You are currently signed in and have granted ' +
            'access to this app.');
    } else {
        handleAuthClick();
        $('#sign-in-or-out-button').html('Sign In/Authorize');
        $('#revoke-access-button').css('display', 'none');
        $('#auth-status').html('You have not authorized this app or you are ' +
            'signed out.');
    }
}
function updateSigninStatus(isSignedIn) {
    setSigninStatus();
}

function callGoogleApi() {
    var request = gapi.client.drive.about.get({ 'fields': 'user' });

    // Execute the API request.
    request.execute(function (response) {
        console.log(response);
    });
}

var populateData = function () {
    console.log('In File search method');
    var pageToken = null;
    try {
        gapi.client.drive.files.list({
    q: "mimeType='image/jpeg'",
    fields: 'nextPageToken, files(id, name)',
    spaces: 'drive',
    pageToken: pageToken
  }, function (err, res) {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log('Got response for file lookup');
                res.files.forEach(function (file) {
                    console.log('Found file: ', file.name, file.id);
                });
                pageToken = res.nextPageToken;
            }
        });
    }
    catch (error) {
        console.error(err);
    }
}

function listFiles() {
        gapi.client.drive.files.list({
          'pageSize': 10,
          'mimeType': 'application/vnd.google-apps.folder',
          'fields': "nextPageToken, files(id, name)"
        }).then(function(response) {
          console.log('Files:');
          var files = response.result.files;
          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              console.log(file.name + ' (' + file.id + ')');
            }
          } else {
            console.log('No files found.');
          }
        });
      }

