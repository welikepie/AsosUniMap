try {
	google.maps.event.addDomListener(window, 'load', maps.initialize);
} catch(e) {
	console.log("Your maps, they seem to have failed to load.");
}

var currSel = "";
var lastMessage = Date.now();

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
		console.log(Date.now());
		//		event = event.originalEvent;
		//lastEventId = messageId;
		if (parseInt(JSON.parse(event.data).timestamp, 10) > lastMessage) {
			lastMessage = parseInt(JSON.parse(event.data).timestamp, 10);
			sse.longtroll(event.data);
		}
		//
	});

}

window.onload = function() {
	tags.retrieve();
	config.sizesOfLabels();
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
	//		setSSE();
	$(document.getElementById("insta")).bind('click', function() {
		$("#modalInside").html("");
		general.customModal({
			"type" : "alert",
			"message" : document.getElementById("JS-instaInput").innerHTML
		});

	});
	$(document.getElementById("faceb")).bind('click', function() {
		/*document.getElementById("facebookShare").preventDefault();
		 FB.ui(
		 {
		 method: 'feed',
		 name: 'This is the content of the "name" field.',
		 caption: 'This is the content of the "caption" field.',
		 description: 'This is the content of the "description" field, below the caption.',
		 message: 'Things Testing'
		 });*/
		$("#modalInside").html("");
		var inputToSend = "";
		general.customModal({
			"type" : "dialog",
			"message" : document.getElementById("JS-facebookInput").innerHTML,
			"confirm" : function() {
				inputToSend = $(".facebookInput").last().val();
				FB.login(function(response) {
					//alert('1');
					if (response.authResponse) {
						var access_token = FB.getAuthResponse()['accessToken'];
						FB.api('/me', function(response) {
							userName = response.name;
							FB.api('/me/feed', 'post', {
								"oauth" : auth,
								"message" : inputToSend,
								privacy : {
									'value' : "EVERYONE"
								}
							}, function(response) {
								if (!response || response.error) {
									//alert('Error occured');
									$(".facebookInput").last().val("There was an error: " + response.error.message);
								} else {
									document.getElementById("modalInside").innerHTML = "<h3>Thanks for being awesome!</h3>";									
									$("#modalDialogue").delay(1000).slideUp(400,function(){					document.getElementById("modalInside").innerHTML = "";});
				
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
		$(".facebookInput").last().val(tags.singleTag);
	});
}
//FB.api('/me/feed/','post',{"access_token":"","message":"First P0st!"},function(user) {
//'/me/feed/',
//'post',
//array('access_token' => $this->access_token, 'message' => 'Playing around with FB Graph..')
//          console.log(user);
//         });
 /*	
 FB.ui({
 method: 'feed',
 name: 'This is the content of the "name" field.',
 link: ' http://www.hyperarts.com/',
 picture: 'http://www.hyperarts.com/external-xfbml/share-image.gif',
 caption: 'This is the content of the "caption" field.',
 description: 'This is the content of the "description" field, below the caption.',
 message: 'Testing Things'
 }, function(response){console.log(response)});
 */

