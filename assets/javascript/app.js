// Initialize Firebase
var config = {
    apiKey: "AIzaSyD-nzMOw1jGbJ97WX7VQG4CGSJRSSKTODs",
    authDomain: "represent-connect.firebaseapp.com",
    databaseURL: "https://represent-connect.firebaseio.com",
    projectId: "represent-connect",
    storageBucket: "represent-connect.appspot.com",
    messagingSenderId: "276903556955"
};
firebase.initializeApp(config);
//Global Firebase variables
var database = firebase.database(),
    authorize = firebase.auth(),
    //google auth firebase instance
    googleProvider = new firebase.auth.GoogleAuthProvider(),
    userLoggedIn = false,
    //used to determine if user is online at any time
    disconnectUser,
    //will be user object with all kinds of datas
    userObject,
    //to allow easy use of the database
    databaseObject;
//This is the function for database reference
database.ref().on("value", function (snapshot) {
    databaseObject = snapshot.toJSON();
    console.log(databaseObject);    
    //firebase function to check whether user is logged into site
    authorize.onAuthStateChanged(function (user) {
        if (user) {//will return non-null if there is a user logged in 
            event.preventDefault();
            userObject = user;//get the returned object for the auth, which has the logged in user's information, namely uid
            userLoggedIn = true;//used below to state user is logged in and to proceed to next page
            $("#welcomeModal").modal("show");
            $("#welcome-body").append("<p> Welcome back, " + databaseObject.users[userObject.uid].name + ", Let's get started! Click to close.</p>");
            $("#welcome-footer").append("<button class='btn btn-primary closeBtn'> Close </button>")
            $("#logIn").css("display", "none");
            $(".nav-pills").append("<li><a id='logOut' href='#logOut'>Log Out </a></li>")  
            $('.closeBtn').on("click", function () {
                $("#welcomeModal").modal("hide");
            });   
        }         
        else if (databaseObject != null) {//if there is nothing in the database , then snapshot is null
            event.preventDefault();
            disconnectUser = database.ref("/users/" + userObject.uid + "/iconnect")
            disconnectUser.set(true);
            disconnectUser.onDisconnect().set("disconnected");                              
        } else {
            userLoggedIn = false;
        }
    });
});

//////////////////////////////////HOME PAGE LOAD/////////////////////////////////////

var pageToLoad;
//listener for when helper button is clicked on home screen
$("#logIn").on("click", function () {
    //checks to see if user is logged in 
    if (!userLoggedIn) {//userLoggedIn is set above in OnAuthChange
        $("#loginModal").modal({ backdrop: 'static', keyboard: false }); //if user not logged in, show modal for user to log in
        $("#loginModal").modal("show");
        pageToLoad = "index.html";//store page to load so that user can be directed to it after login
    } else {//if user is logged in
        database.ref("/users/" + userObject.uid + "/cameFromOtherPage").set(false);
        var win = window.open("index.html", "_self");
        win.focus();
    }

}); 

//////////////////////////////////MODAL CODE/////////////////////////////////////

//This function is for going to sign up modal from Log in Modal
$("#form-up").on("click", function () {
    $("#loginModal").modal("hide");
    $("#signUpModal").modal("show");
    $("#submit-up").show(); 
    $("#close-up").show(); 
    $("#errorMsg").empty();
    

});
//This function is for going to sign in modal from Log In Modal
$("#form-sign").on("click", function () {
    $("#loginModal").modal("hide");
    $("#signInModal").modal("show");
    $("#submit-sign").show();   
    $("#close-sign").show(); 
    $("#passwordBtn").show();   
    $("#errorMsg").empty();

}); 
//This function is for sign ups. 
$("#submit-up").on("click", function () {
    var email = $("#email-up").val(),
        password = $("#password-up").val(),
        name = $("#firstName").val() + " " + $("#lastName").val(),
        errorCode = "";
    $("#errorMsg").empty();

    console.log(email);
    console.log(password);
    console.log(name);
    console.log(errorCode);

    $('#close-up').on("click", function () {
        $("#signUpModal").modal("hide");
        $("#loginModal").modal("show");
    });
    authorize.createUserWithEmailAndPassword(email, password).then(function (user) {
        //creates user 
        $("#signUpModal").modal("hide")        
        $("#logIn").css("display", "none");
        $(".nav-pills").append("<li><a id='logOut' href='#logOut'>Log Out </a></li>")
        userLoggedIn = true;
        database.ref("/users/" + user.uid).set({//sets preliminary information gathered in user form to firebase in the node users/the user's uid - since uid is a primary key for the user, this makes sense to set data here since uid will always be unique to the particular user
            name: name,
            email: email,
        });
    }).catch(function (error) {//shows firebase auth error warning
        var errorCode = error.code,
            errorMessage = error.message;

        console.log(errorMessage);

        if (errorMessage == "The email address is already in use by another account.") {
            $("#errorMsg").empty();
            $("#errorMsg").append("<p>" + errorMessage + " If this is your account, please click the sign in button to sign in.</p>")
        } else {
            $("#errorMsg").empty();
            $("#errorMsg").append("<p>" + errorMessage + " Please try again.</p>")
        }
    });
});
//This function is for changing to login Modal from Sign in Modal.
$('#close-sign').on("click", function () {
    $("#signInModal").modal("hide");
    $("#loginModal").modal("show");
});
//This function is for closing the password Modal
$('#close-password').on("click", function () {
    $("#passwordModal").modal("hide");
    $("#loginModal").modal("show");
});
//This function is for changing to login Modal from Sign Up Modal.
$('#close-up').on("click", function () {
    $("#signUpModal").modal("hide");
    $("#loginModal").modal("show");
});
//This function is for sign ins
$("#submit-sign").on("click", function () {
    var email = $("#email-sign").val(),
        password = $("#password-sign").val();

    console.log(email);
    console.log(password);
    
    //firebase sign in with email and password function
    //returns user - used to personal statement on post sign in modal
    authorize.signInWithEmailAndPassword(email, password).then(function (user) {   
        $("#signInModal").modal("hide")                     
        $("#logIn").css("display", "none");
        $(".nav-pills").append("<li><a id='logOut' href='#logOut'>Log Out </a></li>"); 
        userLoggedIn = true;    
        console.log(userLoggedIn);  
    }).catch(function (error) {//shows firebase auth error warning
        var errorCode = error.code,
            errorMessage = error.message;

        console.log(errorCode);
        console.log(errorMessage);

        if (errorMessage) {
            $("#errorMessage").empty();
            $("#errorMessage").append("<p class='text-center'>" + errorMessage + " Please try again.</p>")            
            $('.closeBtn').on("click", function () {
                $(".closeBtn").css("display", "none");
                $("#errorMessage").empty();
                $("#signInModal").modal("hide");
                $("#loginModal").modal("show");
            });           
        }
    });
});
//This function is for going to Password Modal from Forgot password button
$('#passwordSign').on("click", function () {
    $("#signInModal").modal("hide")
    $("#password-form").show(); 
    $("#close-password").show(); 
    $("#passwordModal").modal("show")
});
//This function is for sending email to user to reset password
$('#submit-password').on("click", function () {      
    var email = $("#email-password").val();
    authorize.sendPasswordResetEmail(email).then(function () {
        $("#passwordModal").modal("hide")
    }).catch(function (error) {
        var errorCode = error.code,
            errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);

        if (errorMessage) {
            $("#errorPassword").empty();
            $("#password-form").css("display", "none");
            $("#errorPassword").append("<p class='text-center'>" + errorMessage + " Please try again.</p>")
            $('.closeBtn').on("click", function () {
                $(".closeBtn").css("display", "none");
                $("#errorPassword").empty();
                $("#loginModal").modal("show");
            });           
        }
    });
});
//signs out user
$(document).on("click", "#logOut", function () {
    firebase.auth().signOut().then(function () {
        var win = window.open("index.html", "_self");
        win.focus();
    }, function (error) {
        console.error('Sign Out Error', error);
    });
}); 

////////////////////////////////// END MODAL CODE/////////////////////////////////////
var getInformation = function () {
    // Google Civic API QueryURL
    var civicBaseURL = "https://www.googleapis.com/civicinfo/v2/representatives?key=",
    civicKey = "AIzaSyD9croCTK4cWvy6I2Zz6VAllN_cufOQkp8",
    params = "&address=" + $('#pac-input').val().trim()
    var representatives = $("#representatives");

    var civicURL = civicBaseURL + civicKey + params;

    console.log(civicURL);

    // Clears all of the text-boxes
    $('#pac-input').val('');
    $('#representatives').empty(); 
    $.ajax({
        url: civicURL,
        method: "GET"
    }).then(function (civicResponse) {
        var officialsArray = civicResponse.officials;
        var officesArray = civicResponse.offices;
        for(var i = 0; i < officesArray.length; i++) {
            var officialIndices = officesArray[i]["officialIndices"]; 
            var position = officesArray[i]["name"];
            //console.log(officialIndices)           
            for(var h = 0; h < officialIndices.length; h++) {
                var index = officialIndices[h]
                console.log("The index is " + index)
                var panelGroup = $('<div class="panel-group rep-results">');
                representatives.append(panelGroup);
                var panelDefault = $('<div class="panel panel-default">');
                panelGroup.append(panelDefault);
                //Panel Heading
                var panelHeading = $('<div class="panel-heading">');
                panelDefault.append(panelHeading);
                //Panel Title
                var panelTitle = $('<div class="panel-title">');
                //Content inside of panel title
                var nameStrong = $('<strong>');
                var nameUpper = officialsArray[index].name.toUpperCase();
                nameStrong.text(nameUpper);
                panelTitle.append(nameStrong);
                if(officialsArray[index].channels || officialsArray[index].address || officialsArray[index].phones || officialsArray[index].urls)   {
                    var contactIcon =  $('<a class="contact-icon" title="Contact" data-target="#contactModal" data-toggle="modal">');
                    if(officialsArray[index].channels) {
                        contactIcon.attr("data-contact-channels", JSON.stringify(officialsArray[index].channels));
                    }
                    if(officialsArray[index].address) {
                        contactIcon.attr("data-contact-address", JSON.stringify(officialsArray[index].address));
                    }  
                    if(officialsArray[index].phones) {
                        contactIcon.attr("data-contact-phones", JSON.stringify(officialsArray[index].phones));
                    }
                    if(officialsArray[index].urls) {
                        contactIcon.attr("data-contact-urls", JSON.stringify(officialsArray[index].urls));
                    }
                    if(officialsArray[index].emails) {
                        contactIcon.attr("data-contact-emails", JSON.stringify(officialsArray[index].emails));
                    }
                    contactIcon.attr("href", "#collapse" + index);
                    contactIcon.append($('<i class="fa fa-envelope-o">'));
                    panelTitle.append(contactIcon) 
                }
                var spanIcon = $('<span class="pull-right">');
                panelTitle.append(spanIcon);
                panelTitle.append("<h6>" + position + "</h6>")
                
                var chevronDown = $('<a class="article-chevron">');
                chevronDown.attr("href", "#collapse" + index);
                chevronDown.attr("data-toggle", "collapse");
                chevronDown.attr("data-search-term", officialsArray[index].name + " " + civicResponse.normalizedInput.state);
                chevronDown.attr("hasExpanded", false);
                chevronDown.append('<i class="fa fa-chevron-down">')
                spanIcon.append(chevronDown);
                
                //Append Panel Title to Panel Heading
                panelHeading.append(panelTitle);
                //Append panel heading to panel title
                panelDefault.append(panelHeading);
                //Expandable Header
                var panelCollaspe = $('<div class="panel-collapse collapse">');
                panelCollaspe.attr("id", "collapse" + index);
                panelDefault.append(panelCollaspe)
                var panelBody = $('<div class="panel-body">');
                panelCollaspe.append(panelBody)
                var panelBodyRow = $('<div class="row">');
                panelBody.append(panelBodyRow);
                var panelBodyPictureColumn = $('<div class="col-sm-3">');
                panelBodyRow.append(panelBodyPictureColumn);
                var panelBodyNewsColumn = $('<div class="col-sm-9">');
                panelBodyNewsColumn.attr("id", "repResultsPanelBody" + index);
                chevronDown.attr("data-news-article-target", "repResultsPanelBody" + index);
                panelBodyRow.append(panelBodyNewsColumn);

                //HTML for panel body
                if(officialsArray[index].photoUrl) {
                    panelBodyPictureColumn.append($('<img src="' + officialsArray[index].photoUrl + '" class="img-responsive img-thumbnail float-left rep-image">'))
                }
                else {
                    //Add a placeholder image that says No Image Found
                    var placeholderImg = "./assets/images/Placeholder-image.jpg"
                    panelBodyPictureColumn.append($('<img src="' + placeholderImg + '" class="img-responsive img-thumbnail float-left rep-image">'))
                }
            
            }
 
        } 
        console.log(civicResponse);
        console.log(civicResponse.normalizedInput.state);

    });
};
$(document.body).on("click", ".article-chevron", function (event) {
    if ($(this).attr("hasExpanded") === "true") {
        return;
    }
    $(this).attr("hasExpanded", "true");
    console.log(typeof $(this).attr("hasExpanded"));
    var targetContainerID = $(this).attr("data-news-article-target");
    console.log(targetContainerID);
    var targetContainer = $("#" + targetContainerID);
    //console.log(targetContainer.html());
    targetContainer.empty();
    // News API queryURL
    var newsBaseURL = "https://newsapi.org/v2/everything?q=",
        repParams = $(this).attr("data-search-term"),
        newsKey = "&apiKey=672f8d40b47842c3bd2ac11a4f688a15";

    var newsURL = newsBaseURL + repParams + newsKey;

    console.log(newsURL);

    $.ajax({
        url: newsURL,
        method: "GET"
    }).then(function (newsResponse) {
        var articles = newsResponse.articles;
        console.log(newsResponse)
        targetContainer.append($('<h3 class="display-3">').text("Recent Articles"));
        if(articles.length) {
            var buttonGroup = $('<div class="btn-group-vertical" role="group" aria-label="News Articles">')
            targetContainer.append(buttonGroup);
            for(var i = 0; i < 5; i++) {
                if(articles[i]) {
                    var articleLink = $('<a class="btn btn-primary news-button" role="button">');
                    articleLink.attr("href", articles[i]["url"]);
                    articleLink.attr("target", "_blank");
                    articleLink.text(articles[i]["title"]);
                    buttonGroup.append(articleLink);
                }
            }
        } else {
            var noResultsFound = $('<h4 class="display-4">').text("No News Stories Found");
            targetContainer.append(noResultsFound);
        }
        var poweredBy = $('<p class="text-muted align-right">').text("Powered By ");
        targetContainer.append(poweredBy);
        var aTagLink = $('<a>');
        aTagLink.attr("href", "https://newsapi.org/");
        aTagLink.attr("target", "_blank");
        aTagLink.text("NewsAPI");
        poweredBy.append(aTagLink);
    });
})
$(document.body).on("click", ".contact-icon", function(event){
    var address;
    var channels;
    var phones;
    var urls;
    var emails;
    $("#modal-contact-address-line1").empty();
    $("#modal-contact-address-line2").empty();
    $("#modal-contact-address-line3").empty();
    $("#modal-contact-address-website").empty();
    $("#social-media-container").empty();
    $("#modal-contact-address-phone").empty();
    $("#modal-contact-address-website").empty();
    $("#modal-contact-address-email").empty();
    if($(this).attr("data-contact-address")) {
        address = JSON.parse($(this).attr("data-contact-address"));
    }
    if($(this).attr("data-contact-channels")) {
        channels = JSON.parse($(this).attr("data-contact-channels"));
    }
    if($(this).attr("data-contact-phones")) {
        phones = JSON.parse($(this).attr("data-contact-phones"));
    }
    if($(this).attr("data-contact-urls")) {
        urls = JSON.parse($(this).attr("data-contact-urls"));
    }
    if($(this).attr("data-contact-emails")) {
        emails = JSON.parse($(this).attr("data-contact-emails"));
    }
    if(!address) {
        $("#modal-contact-address-line1").text("N/A");
    } else {
        if(address[0].line1) {
            $("#modal-contact-address-line1").text(address[0].line1);
        }
        if(address[0].line2) {
            $("#modal-contact-address-line2").text(address[0].line2);
        }
        if(address[0].city) {
            $("#modal-contact-address-line3").append(address[0].city + ", ")
        }
        if(address[0].state) {
            $("#modal-contact-address-line3").append(address[0].state + " ")
        }
        if(address[0].zip) {
            $("#modal-contact-address-line3").append(address[0].zip)
        }
    }
    if(!channels) {
        $("#social-media-container").text("N/A");

    } else {
        for(var i = 0 ; i < channels.length; i++) {
            if(channels[i]["type"] === "Twitter") {
                var span = $('<span>');
                $("#social-media-container").append(span);
                var aTag = $('<a>');
                aTag.attr("href", "http://twitter.com/" + channels[i]["id"])
                aTag.attr("target", "_blank");
                span.append(aTag)
                var twitterIcon = $('<i class="fa fa-twitter fa-3x">');
                aTag.append(twitterIcon);
            }
            if(channels[i]["type"] === "Facebook") {
                var span = $('<span>');
                $("#social-media-container").append(span);
                var aTag = $('<a>');
                aTag.attr("href", "http://facebook.com/" + channels[i]["id"]);
                aTag.attr("target", "_blank");
                span.append(aTag)
                var facebookIcon = $('<i class="fa fa-facebook fa-3x">');
                aTag.append(facebookIcon);
            }
        }
    }
    if(!phones) {
        $("#modal-contact-address-phone").text("N/A");

    } else {
        $("#modal-contact-address-phone").text(phones[0]);
    }
    if(!emails) {
        $("#modal-contact-address-email").text("N/A");
    } else {
        var aTag = $('<a>');
        aTag.attr("href", "mailto:" + emails[0])
        aTag.text(emails[0]);
        $("#modal-contact-address-email").append(aTag);
    }
    if(!urls) {
        $("#modal-contact-address-website").text("N/A");
    } else {
        var aTag = $('<a>');
        aTag.attr("href", urls[0])
        aTag.attr("target", "_blank");
        aTag.append($('<i class="fa fa-external-link-square fa-3x">'))
        $("#modal-contact-address-website").append(aTag);
    }
    console.log(address);
    console.log(channels);
    console.log(phones);
    console.log(urls);
})
$("#runSearch").on("click", function(event){
    if (!userLoggedIn) {
        event.preventDefault();
        $("#loginModal").modal("show");
        console.log(userLoggedIn);
    } else {
        event.preventDefault();
        getInformation();
        return;
    }
});
