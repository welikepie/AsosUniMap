var links = ["http://www.asos.com/", "http://www.asos.com/", "http://www.asos.com/", "http://www.asos.com/"];
var text = ["EXPLORE >", "WATCH >", "SHOP >", "WIN >"];

var currSel = "";
var lastMessage = Date.now();

function checkId() {
	//console.log(lastEventId - messageId);
	if (lastEventId < messageId) {
		return true;
	}
	return false;
}

function setSSE() {
	var es = new EventSource("http://localhost:1337/events");
	/*es.addEventListener("open", function(e) {
	 //console.log("Connected!");
	 });
	 es.addEventListener("error", function(e) {
	 //.log("erroring");
	 });
	 es.addEventListener("info", function(event) {
	 //console.log(event);
	 });*/
	es.addEventListener("message", function(event) {
		//console.log(event);
		//console.log(Date.now());
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

	console.log("adding listeners");
	$('#twitterButton').load(function() {
		$(this).show();
	});
	var open = false;
	var totalHeight = document.documentElement.clientHeight;
	var contHeight = totalHeight - 165;
	$("#SurroundContainer").css("height", contHeight + 6);
	$("#surrounder").css("height", contHeight - 42);
	var popUp = false;

	if (document.documentElement.clientWidth < 480) {
		/*$("#JS-MBtopMenu").click(function(e){
		 console.log(e);
		 //e.preventDefault();
		 //e.stopPropagation();
		 console.log("CLICKING")
		 }
		 );*/
		$("#searchGO").css("display", "block");
		console.log("displaying!");
		$("#search").html("");
		$("#searchProxy").css("display", "none");
	
		$("#search").html("");
		$("#blackOverlay").html("");
	//	$("#searchField").css("width", document.documentElement.clientWidth - 83);
		//$("#searchProxy").append($("#search").html());

		/*
		 var img = document.createElement("img");
		 img.setAttribute("id","pinImage");
		 img.setAttribute("src","images/pinInput.png");
		 $("#twitterButton").prop("src","twitMobi.html");
		 document.getElementById("twitterButton").contentWindow.location.reload();
		 $("#labelText").html("<p>ADD YOUR SPOT TO </p><p>THE MAP TO WIN A PRIZE</p>");
		 $("#socialProxy").append(img);
		 $("#socialProxy").append($("#blackOverlay").html());
		 */

		$("#map-overlay").first().css("top", (totalHeight - 60) + "px");
		$("#SurroundContainer").css("height", totalHeight - 105);
		$("#surrounder").css("height", totalHeight - 160);
		// don’t download complicated script
		// use low-source images instead of full-source ones
		$('#pinImage').click(function() {
			////console.log("clicked");
			$('#tagI').css("display", "block");
			$('#socialProxy').css("display", "none");
			$('#tagDiv').css("width", '');
		});
		$('#studentImage').click(function(e) {
			tags.filtration = "";
			elements.fullUpdate();
			$("#searchProxy").css("display", "none");
			$("#searchI").css("display", "block");
			$("#searchDiv").attr("style", "");
			if (popUp == true) {
				popUp = false;
				//rest of your logic will go here
				$('#map-overlay').attr("class", "upWeGo");
				$('#map-overlay').css("top", (totalHeight - 60) + "px");
				e.stopPropagation();
				e.preventDefault();
			}

		});
		$('#map-overlay').click(function(e) {
			//console.log(e);
			if (popUp == false) {
				popUp = true;
				//console.log(e);
				//rest of your logic will go here
				$('#map-overlay').attr("class", "upWeGo");
				$('#map-overlay').css("top", 120 + "px");
			}
		});

		$(document.getElementById("searchGO")).bind('click', function() {

			$("#content").css("display", "block");
			var stuff = $("#searchField").val();
			if (stuff == "SEARCH UNI") {
				stuff = "";
			}
			//console.log($("#searchField").val().toUpperCase());
			$("#header").text("SEARCH RESULTS");
			if (tags.filtration != stuff) {
				tags.filtration = stuff;
				$("#searchContent").text(stuff.toUpperCase());
			}
			if (popUp == false) {
				popUp = true;
				$('#map-overlay').attr("class", "upWeGo");
				$('#map-overlay').css("top", 120 + "px");
			}
			elements.fullUpdate();
		});

		$('#header').click(function(e) {
			if (popUp == true) {
				popUp = false;
				//rest of your logic will go here
				$('#map-overlay').attr("class", "upWeGo");
				$('#map-overlay').css("top", (totalHeight - 60) + "px");
				e.stopPropagation();
				e.preventDefault();
			}
		});
		$('#searchI').click(function(e) {
			$('#searchI').css("display", "none");
			$('#searchProxy').css("display", "block");
			$("#searchDiv").css("width", "100%");
			$('#tagI').css("display", "block");
			$('#socialProxy').css("display", "none");
			$('#tagDiv').css("width", '');
			e.stopPropagation();
			e.preventDefault();
		})

		$('#tagI').click(function() {
			$('#tagDiv').css("width", "100%");
			$('#tagI').css("display", "none");
			$('#socialProxy').css("display", "block");
			$("#searchProxy").css("display", "none");
			$("#searchI").css("display", "block");
			$("#searchDiv").attr("style", "");
		});

		$('#map-canvas').click(function(e) {
			$('#tagI').css("display", "block");
			$('#socialProxy').css("display", "none");
			$('#tagDiv').css("width", '');

			$("#searchProxy").css("display", "none");
			$("#searchI").css("display", "block");
			$("#searchDiv").attr("style", "");
			//console.log(e);
			if ($("#menuHolder").length > 0) {
				open = false;
				var i = document.getElementById("menuHolder");
				i.parentNode.removeChild(i);
			}
			if (popUp == true) {
				tags.filtration = "";
				elements.fullUpdate();
				popUp = false;
				e.stopPropagation();
				e.preventDefault();
				//rest of your logic will go here
				$('#map-overlay').attr("class", "upWeGo");
				$('#map-overlay').css("top", (totalHeight - 60) + "px");

			}
		})
		
		/*$('#tapMENU').bind("click", function() {
		 if (open == false) {
		 open = true;
		 //		<a class="prodLink"><div>YOURMOM ></div></a>
		 var varToAppend = document.getElementById("JS-MBtopMenu");
		 var div = document.createElement("div");
		 div.setAttribute("id", "menuHolder");
		 for (var i = 0; i < links.length; i++) {
		 var a = document.createElement("a");
		 a.setAttribute("class", "prodLink");
		 a.setAttribute("href", links[i]);
		 a.setAttribute("target", "_blank");
		 var d = document.createElement("div");
		 dText = document.createTextNode(text[i]);
		 d.appendChild(dText);
		 a.appendChild(d);
		 div.appendChild(a);
		 }
		 varToAppend.appendChild(div);
		 } else {
		 open = false;
		 var i = document.getElementById("menuHolder");
		 i.parentNode.removeChild(i);
		 }
		 })*/
	} else {
		$("#searchProxy").html("");
		$("#socialProxy").html("");
		$('#twitterButton').load(function() {
			$(this).show();
		});
		
	}

	$('#searchField').focus(function() {
		if (this.value == this.defaultValue) {
			this.value = '';
			$(this).removeClass('default');	
		}
	});
	$('#searchField').keypress(function(e) {
		if (e.which == 13) {
			jQuery(this).blur();
			if(document.documentElement.clientWidth < 480){
				$("#searchGO").focus().click();
			}else{
				$('#searchMe').focus().click();
			}
		}
	});

	$('#searchField').blur(function() {
		if (this.value == '') {
			this.value = this.defaultValue;
			$(this).addClass('default');
		};
	});
	tags.retrieve();
	config.sizesOfLabels();
	$(document.getElementById("searchClear")).bind('click', function() {
		$("#content").css("display", "block");
		$("#searchError").css("display", "none");
		document.getElementById("searchField").value = "";
		//	if(document.documentElement.clientWidth > 480){
		document.getElementById("searchClear").style.display = "none";
		//	}
		//	else{
		//			$("#searchProxy").css("display","none");
		//			$("#searchI").css("display","block");
		//			$("#searchDiv").attr("style","");
		//	}

		//mmanager.hashContentManager.refresh();
		tags.filtration = "";
		elements.fullUpdate();

	});
	if (document.documentElement.clientWidth > 480) {
		$(document.getElementById("searchMe")).bind('click', function() {
			$("#content").css("display", "block");
			var stuff = $("#searchField").val();
			if (stuff == "SEARCH UNI") {
				stuff = "";
			}
			//	console.log($("#searchField").val().toUpperCase());
			$("#header").text("SEARCH RESULTS");
			if (tags.filtration != stuff) {
				if (stuff == "") {
					$("#searchClear").css("display", "none");
				} else {
					if (document.documentElement.clientWidth > 480) {
						$("#searchClear").css("display", "block");
					}
				}
				tags.filtration = stuff;
				$("#searchContent").text(stuff);
			}
			//console.log("getting here!");
			elements.fullUpdate();
		});
	}
	setSSE();
	$("#JS-bbMoreInfo, #infolink, #moreInfoLink").bind('click', function() {
		$("#modalInside").html("");
		general.customModal({
			"type" : "alert",
			"message" : document.getElementById("JS-MoreInfo").innerHTML,
			"padded" : false
		});
	});

	$(document.getElementById("insta")).bind('click', function() {
		$("#modalInside").html("");
		general.customModal({
			"type" : "alert",
			"message" : document.getElementById("JS-instaInput").innerHTML,
			"padded" : true
		});

	});
	$(document.getElementById("faceb")).bind('click', function() {
		$("#modalInside").html("");
		var inputToSend = "";
		general.customModal({
			"type" : "dialog",
			"message" : document.getElementById("JS-facebookInput").innerHTML,
			"padded" : true,
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
									$("#modalDialogue").delay(1000).slideUp(400, function() {
										document.getElementById("modalInside").innerHTML = "";
									});

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
		//$(".facebookInput").last().val(tags.singleTag);
	});
}
//FB.api('/me/feed/','post',{"access_token":"","message":"First P0st!"},function(user) {
//'/me/feed/',
//'post',
//array('access_token' => $this->access_token, 'message' => 'Playing around with FB Graph..')
//          //console.log(user);
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
 }, function(response){//console.log(response)});
 */
try {
	google.maps.event.addDomListener(window, 'load', maps.initialize);
} catch(e) {
	//console.log("Your maps, they seem to have failed to load.");
}

