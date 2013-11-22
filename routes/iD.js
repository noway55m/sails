var log = require('log4js').getLogger(), 
	utilityS = require("./utility"),
	Ad = require("../model/ad"),
	crypto = require('crypto'),
	fs = require('fs'),
	path = require('path'),
	moment = require('moment'),
	domParser = require('xmldom').DOMParser,
	xmlSerializer = require('xmldom').XMLSerializer,
	config = require('../config/config');

// test
exports.update = function(req, res) {
	
	console.log(req.body.updateJson);
	if(req.body.updateJson){
		
		var updateObj = JSON.parse(req.body.updateJson);
		console.log(updateObj);
				
		var	mapxml_path = path.dirname() + "/public/iD/map.xml";
		fs.readFile(mapxml_path, "utf8", function(err, data) {

			var cleanedString = data.replace("\ufeff", "");
			//log.info("data string: " + cleanedString);
			var document = new domParser().parseFromString(cleanedString);
		    //log.info(document.getElementById("-17407"));
		    var element = document.getElementById("-17500");
		    var lon = element.getAttribute("lon");
		    var lat = element.getAttribute("lat");
		    
		    var documentU = updateMapXML(updateObj, document);
		    
		    console.log(documentU.toString());
		    
		    fs.writeFile(mapxml_path, documentU.toString(), function(err){
		    	
		    	if(err)
		    		log.error(err);
		    	
				res.send("done");
		    	
		    });
		    
		    
		});		
		
	}	
	
};


function getObjType(id){
	if (id.indexOf('n') != -1) {
		return "n";
	} else {
		return "w";
	}	
}

function parseObjId(id, type) {

	// Check modified type: node or way
	if (type == "n") {
		id = id.replace('n', '');
	} else {
		id = id.replace('w', '');
	}
	return id;
	
}

var parser = {
		
	n: function(obj, element, document){		
		element.setAttribute("lon", obj.loc[0]);        	
		element.setAttribute("lat", obj.loc[1]);    					
	},
	
	w: function(obj, element, document){
		
    	if(obj.nodes){
    		obj.nodes.forEach(function(node){
    			
    			var newChilds = [];
    			var id = parseObjId(node.id, "n");
            	var childElement = element.getElementsById(id);
            	if(childElement){
            		
            		childElement.
            		newChilds.push(childElement);
            		
            	}else{
            		
            		newChilds.push(childElement);
            		
            	}
            	
    			childElement.children = [];

    		});
    	}
    	
    	if(obj.tags){
    		for( tagKey in obj.tags){
            	var tag = xml.createElement("tag");
            	tag.setAttribute("k", tagKey);
            	tag.setAttribute("v", obj.tags[tagKey]);
            	way.appendChild(tag);        			
    		}
    	}			
				
	}
		
}


function updateMapXML(updateObj, document){

	var osmElement = document.getElementsByTagName("osm")[0];
	
	
    // Add Created node
    var createdNodes = updateObj.created ? updateObj.created : [];
    for(var key in createdNodes){
    	
    	var value = createdNodes[key];
    	var type = getObjType(value.id);
    	var id = parseObjId(value.id, type);
    	var element = null;
    	if(type === 'n'){
    		
    		log.info("---------------- create node ---------------------")
    		element = document.createElement("node");
        	element.setAttribute('id', id);
        	element.setAttribute('lon', value.loc[0]);
        	element.setAttribute('lat', value.loc[1]);
        	element.setAttribute("action", 'modify');
        	element.setAttribute("visible", 'true');
        	
    	}else{
    		
    		log.info("---------------- create way ---------------------")    		
    		element = document.createElement("way");
        	element.setAttribute("action", 'modify');
        	element.setAttribute("visible", 'true');
    		
    		var nds = value.nodes ? value.nodes : [];
    		var preElement = null;
    		nds.forEach(function(nd){
    			var ndElement = document.createElement("nd");
    			ndElement.setAttribute('ref', parseObjId(node.toString()));
    			element.appendChild(nd);    
    			
    		});
    		
       		var tags = value.tags ? value.tags : [];       	 
    		tags.forEach(function(tag, key){
    			
    			var tagElement = document.createElement("tag");
    			tagElement.setAttribute("k", tagKey);
    			tagElement.setAttribute("v", obj.tags[tagKey]);
    			element.appendChild(tag);           		
    			
    		});
    		
    	}
    	
    	osmElement.appendChild(element);
    }
    
    /*
    // Remove delete node
    var deletedNodes = updateObj.deleted ? updateObj.deleted : [];
    createdNodes.forEach(function(value, key){
    
    	
    	
    });
    
    
    
    // Update modified node
    var modifiedNodes = updateObj.modified ? updateObj.modified : [];
    modifiedNodes.forEach(function(value, key){
    	
    	console.log("modified key: " + key);
    	console.log("modified value: " + value);
        
    	var type = getObjType(value.id);
    	var id = parseObjId(value.id, type);
    	var thePsrser = parser[n]; 
    	var element = document.getElementById(id);
    	if(element){
    		
    		thePsrser(value, element, document);
    		
    	}
    	
    });
    */
	
    return document;
	
}