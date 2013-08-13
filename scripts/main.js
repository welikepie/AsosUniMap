 var xhReq = new XMLHttpRequest();
 xhReq.open("GET", "https://api.twitter.com/1.1/search/tweets.json?q=#yolo", true);
 xhReq.onreadystatechange = function() {
 console.log(xhReq.status);
   if (xhReq.readyState != 4)  { return; }
   var serverResponse = xhReq.responseText;
   console.log(serverResponse);
 };
 //xhReq.send(null);