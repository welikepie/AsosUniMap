window.onload = function(){
	
	var up = false;	
	  setTimeout(
	  		function(){
	  			window.scrollTo(0, 1);
	  		  
	 var thing = window.innerHeight;
//	 alert(thing);
	$("#overlay").css("height",thing - 165);
	$("#overlay").css("bottom",((thing - 165)*-1) + 60);

	  		  
	$("#map").on("click",function(){
			up = false;
			$("#overlay").css("bottom",((thing - 165)*-1) + 60);
	})
	$("#heading").on("click",function(){
		if(up == false){
			up = true;
			$("#overlay").css("bottom",0);
		}
		else{
			up = false;
			$("#overlay").css("bottom",((thing - 165)*-1) + 60);
		}
	})
			},
	  	 0);
	
}
