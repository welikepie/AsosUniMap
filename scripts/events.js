google.maps.event.addDomListener(window, 'load', maps.initialize);

window.onload = function() {
	tags.retrieve();
	if (!!window.EventSource) {
		var source = new EventSource('http://localhost:1337/events');
	} else {
		// Result to xhr polling :(
		//	tpht.easyXML("get","/events","",sse.longtroll(response));
	}
	source.addEventListener('message', function(e) {
		//  console.log(e);
		sse.longtroll(e);
	}, false);

	source.addEventListener('open', function(e) {
		console.log("Yay!");
	}, false);
//scroll handler for scroll box is in main.js. Aww yis.
	source.addEventListener('error', function(e) {
		if (e.readyState == EventSource.CLOSED) {
			console.log("A dragon appeared!");
		}
	}, false);
	document.getElementById("searchClear").addEventListener('click', function(){
		document.getElementById("searchField").value = "";
		document.getElementById("searchClear").style.display="none";
		tags.filtration = "";
		elements.fullUpdate();
	});
	document.getElementById("searchMe").addEventListener('click', function(){
		var stuff = document.getElementById("searchField").value;
		if(tags.filtration != stuff){
			if(stuff == ""){
				document.getElementById("searchClear").style.display="none";
			}else{
				document.getElementById("searchClear").style.display="block";
			}
			tags.filtration = stuff;
		}
		elements.fullUpdate();		
	});
	document.getElementById("facebookShare").addEventListener('click', function() {
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
			"message" : "<strong>What do you want to say?</strong><p>Here's your chance to be awesome. Don't be shy!</p>" +tags.singleTag +" <input type='text' id='facebookInput'/>",
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
									document.getElementById("facebookInput").value = "There was an error: "+response.error;
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

