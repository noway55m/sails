$(document).ready(function(){
	
	$("#add-up-floor").on("click", function(){
		var data ={
				id: buildingId,
				layer: currentUpFloor,
				// type: 0
			};		
        $.ajax({
            type: "POST",
            url: "/user/floor/create",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function(data, status){
            	
            	$("#floor-list").append("<option>" + currentUpFloor + "</option>")
        		currentUpFloor++;           	
            	
            }
        });			
	});
	
	$("#add-down-floor").on("click", function(){
		var thefloor = Math.abs(currentDownFloor);
		var data ={
			id: buildingId,
			layer: currentDownFloor,
			type: 0
		};		
        $.ajax({
            type: "POST",
            url: "/user/floor/create",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function(data, status){
            	
        		currentDownFloor--;           	
            	
            }
        });		
	});
	
	
});