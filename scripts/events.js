try {
	google.maps.event.addDomListener(window, 'load', maps.initialize);
} catch(e) {
	console.log("Your maps, they seem to have failed to load.");
}

var links = ["http://www.asos.com/","http://www.asos.com/","http://www.asos.com/","http://www.asos.com/"];
var text = ["EXPLORE >", "WATCH >", "SHOP >", "WIN >"];

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
	var open = false;
	var totalHeight = document.documentElement.clientHeight;
	var contHeight = totalHeight - 165;
	$("#SurroundContainer").css("height",contHeight);
	$("#surrounder").css("height",contHeight-12);	
	$('#searchField').focus(function(){
    if (this.value == this.defaultValue) {
        this.value = '';
        $(this).removeClass('default');
    };
});
var popUp = false;
 $('#map-overlay').click(function(e){
            if(popUp == false){
            	popUp = true;
               console.log(e);
               e.stopPropagation();
               e.preventDefault();
               //rest of your logic will go here
   $('#map-overlay').attr("class","upWeGo");                
   $('#map-overlay').css("top",150+"px");
}
    });


if (document.documentElement.clientWidth < 480) {
	$("#map-overlay").first().css("top",(totalHeight-100)+"px");
		$("#SurroundContainer").css("height",totalHeight-170);
	$("#surrounder").css("height",totalHeight-182);	
	// don’t download complicated script
	// use low-source images instead of full-source ones
}
$('#map-canvas').click(function(e){
	console.log(e);
	if(popUp == true){
		popUp = false;
		    e.stopPropagation();
               e.preventDefault();
               //rest of your logic will go here
   $('#map-overlay').attr("class","upWeGo");                
   $('#map-overlay').css("top",(totalHeight-100)+"px");

	}
})
$('#tapMENU').bind("click",function(){
	if(open == false){
		open = true;
//		<a class="prodLink"><div>YOURMOM ></div></a>
		var varToAppend = document.getElementById("JS-MBtopMenu");
		var div = document.createElement("div");
		div.setAttribute("id","menuHolder");
		for(var i = 0; i < links.length; i++){
			var a = document.createElement("a");
			a.setAttribute("class","prodLink");
			a.setAttribute("href",links[i]);
			a.setAttribute("target","_blank");
			var d = document.createElement("div");
			dText = document.createTextNode(text[i]);
			d.appendChild(dText);
			a.appendChild(d);
			div.appendChild(a);
		}
		varToAppend.appendChild(div);
	}
	else{
		open = false;
		var i = document.getElementById("menuHolder");
			i.parentNode.removeChild(i);
	}
})

$('#searchField').keypress(function(e) {
        if(e.which == 13) {
            jQuery(this).blur();
            jQuery('#searchMe').focus().click();
        }
    });
    
$('#searchField').blur(function(){
    if (this.value == '') {
        this.value = this.defaultValue;
        $(this).addClass('default');
    };
});
	tags.retrieve();
	config.sizesOfLabels();
	$(document.getElementById("searchClear")).bind('click', function() {
		document.getElementById("searchField").value = "";
		document.getElementById("searchClear").style.display = "none";
		//mmanager.hashContentManager.refresh();
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

