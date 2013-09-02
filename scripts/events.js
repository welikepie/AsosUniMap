google.maps.event.addDomListener(window, 'load', maps.initialize);

window.onload = function(){
	tags.retrieve();
if (!!window.EventSource) {
  var source = new EventSource('/events');
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

source.addEventListener('error', function(e) {
  if (e.readyState == EventSource.CLOSED) {
  console.log("A dragon appeared!");
  }
}, false);

}

