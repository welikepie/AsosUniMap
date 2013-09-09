google.maps.event.addDomListener(window, 'load', maps.initialize);

var lastMessage = new Date().getTime();
function checkId() {
	console.log(lastEventId - messageId);
	if (lastEventId < messageId) {
		return true;
	}

	return false;
}

function setSSE() {
	var es = new EventSource("http://localhost:1337/events");
	/*es.addEventListener("open", function(e) {
		console.log("Connected!");
	});
	es.addEventListener("error", function(e) {
		console.log("erroring");
	});
	es.addEventListener("info", function(event) {
		console.log(event);
	});*/
	es.addEventListener("message", function(event) {
			console.log(event);
			console.log(new Date().getTime());
//		event = event.originalEvent;
		//lastEventId = messageId;
		if(parseInt(JSON.parse(event.data).timestamp,10) > lastMessage){
			lastMessage = parseInt(JSON.parse(event.data).timestamp,10);
			sse.longtroll(event.data);
		}
		//
	});

}

window.onload = function() {
	tags.retrieve();
	$(document.getElementById("searchClear")).bind('click', function() {
		document.getElementById("searchField").value = "";
		document.getElementById("searchClear").style.display = "none";
		tags.filtration = "";
		elements.fullUpdate();
	});
	$(document.getElementById("searchMe")).bind('click', function() {
		console.log("CALLING");
		var stuff = $("#searchField").val();
		console.log(stuff);
		if (tags.filtration != stuff) {
			if (stuff == "") {
				$("#searchClear").css("display", "none");
			} else {
				$("#searchClear").css("display", "block");
			}
			tags.filtration = stuff;
		}
		elements.fullUpdate();
	});
		setSSE();

	$(document.getElementById("facebookShare")).bind('click', function() {
		/*document.getElementById("facebookShare").preventDefault();
		 FB.ui(
		 {
		 method: 'feed',
		 name: 'This is the content of the "name" field.',
		 caption: 'This is the content of the "caption" field.',
		 description: 'This is the content of the "description" field, below the caption.',
		 message: 'Things Testing'
		 });*/
		var inputToSend = "";
		general.customModal({
			"type" : "dialog",
			"message" : "<strong>What do you want to say?</strong><p>Here's your chance to be awesome. Don't be shy!</p>" + tags.singleTag + " <input type='text' id='facebookInput'/>",
			"confirm" : function() {
				inputToSend = document.getElementById("facebookInput").value;
				FB.login(function(response) {
					//alert('1');
					if (response.authResponse) {
						var access_token = FB.getAuthResponse()['accessToken'];
						//alert('Access Token = ' + access_token);
						FB.api('/me', function(response) {
							//alert('Good to see you, ' + response.name + '.');
							userName = response.name;
							//     document.getElementById('btnPostFeed').style.display = 'block';

							FB.api('/me/feed', 'post', {
								"oauth" : auth,
								"message" : tags.singleTag + " " + inputToSend,
								privacy : {
									'value' : "EVERYONE"
								}
							}, function(response) {
								console.log(response);
								if (!response || response.error) {
									//alert('Error occured');
									document.getElementById("facebookInput").value = "There was an error: " + response.error;
								} else {
									document.getElementById("modalDialogue").style.display = "none";
									document.getElementById("modalInside").innerHTML = "";
									//alert('Post ID: ' + response.id);
								}
							});
						});
					} else {

					}
				}, {
					scope : "publish_actions"
				});
			}
		});
	});
}
//		  FB.api('/me/feed/','post',{"access_token":"","message":"First P0st!"},function(user) {
//'/me/feed/',
//'post',
//array('access_token' => $this->access_token, 'message' => 'Playing around with FB Graph..')
//          console.log(user);
//         });
/*	FB.ui({
 method: 'feed',
 name: 'This is the content of the "name" field.',
 link: ' http://www.hyperarts.com/',
 picture: 'http://www.hyperarts.com/external-xfbml/share-image.gif',
 caption: 'This is the content of the "caption" field.',
 description: 'This is the content of the "description" field, below the caption.',
 message: 'Testing Things'
 }, function(response){console.log(response)});*/

