var Inventories = {};
var itemId = 0;
//id = Object.keys(Inventories).length;

function Position(x, y){
	if (x === undefined) {
		x = null;
	}
	if (y === undefined) {
		y = null;
	}
	this.x = x;
	this.y = y;
	
	this.toString = function(){
		return ("x: " + this.x + ", y: " + this.y);
	}
}

function Size(width, height){
	this.width = width;
	this.height = height;
	
	this.toString = function(){
		return ("width: " + this.width + ", height: " + this.height);
	}
}

function inventory(id, name, position, size, maxWeight, volume, items) {
	this.id = id;
	this.name = name;
	this.position = position;
	this.size = size;
	this.maxWeight = maxWeight;
	this.currentWeight = 0.0;
	this.volume = volume;
	this.items = items;	
	
	// functions and methods
	this.getSize = function() {
		return this.size;
	}
	
	this.setSize = function(size) {
		this.size = size;
	}
	
	this.getPosition = function() {
		return this.position;
	}
	
	this.setPosition = function(position) {
		this.position = position;
		debug('Inventory ' + this.id + ' position.x: ' + position.x + ', position.y: ' + position.y);
	}	
	
	this.addItemsHTML = function(newItem){
		var items = this.items;	
		var invenoryId = this.id;
		debug("adding items " + newItem.id + " html to inventory " + invenoryId);
		var inventoryContent = $('#inventory-' + invenoryId).find('.invContent');
		
		// if position of newItem is not set explicitly - calculate it
		if(newItem.position.x == null){
			var keys = Object.keys(items)
			if (keys.length > 0){
				var lastItem = items[keys[keys.length-1]];
				var rightBorder = lastItem.position.x+lastItem.size.width;
				
				if ((this.size.width-rightBorder) >= (newItem.size.width)){
					newItem.position.x = rightBorder + 1;
					newItem.position.y = 0;
				}else{
					newItem.position.x = 0;
					newItem.position.y = lastItem.position.y + lastItem.size.height + 1;
				}
			}else{
				newItem.position.x = 0;
				newItem.position.y = 0;
			}
		}
		//var bottomBorder = lastItem.position.y+lastItem.size.height;
		newItem.createHTML();
		inventoryContent.append(newItem.html);
		
		
		$("#item-" + newItem.id).draggable({
			appendTo: "body",
			helper: "clone",
			opacity: 0.35,
			snap: true,
			snapMode: "both",
			snapTolerance: 5, 
			
			start: function( event, ui ) {
				$("#item-" + newItem.id).draggable( "option", "revert", false );
				$("#item-" + newItem.id).droppable( "disable" );
				//$('.accepted').each(function(){$(this).removeClass('accepted');});
			},
			stop: function( event, ui ) {
				var items = Inventories[invenoryId].items;
				debug("stopped dragging " + newItem.id);				
				var parent = $("#item-" + newItem.id).closest('.inventory');
				var acceptedBy = $('.accepted');
				// if not accepted by any droppable - revert position to initial
				if (acceptedBy.length == 0){
					//$("#item-" + newItem.id).draggable( "option", "revert", true );	
					debug('dragable dropped at non-droppable element');					
				}else{
					var acceptedID = acceptedBy.attr('id').split("-")[1];
					var invContainer = acceptedBy.find('.invContent');
					var helperDiv = $(".item.ui-draggable.ui-draggable-dragging");
					var newLeftPosition = helperDiv.offset().left - invContainer.offset().left;
					var newTopPosition = helperDiv.offset().top - invContainer.offset().top;
					var newPosition = new Position(newLeftPosition, newTopPosition);
					items[parseInt(newItem.id)].setPosition(newPosition);
					// if moved to another inventory
					if (parent.attr('id')!=acceptedBy.attr('id')){						
						Inventories[invenoryId].removeItem(newItem.id);
						Inventories[acceptedID].addItem(newItem);
					}
					acceptedBy.removeClass('accepted');
					debug($(this).attr('id') + ' dropped at ' + acceptedBy.attr('id'));
					debug("items in original inventory " + invenoryId + ": " + Object.keys(items));
					debug("items in destination inventory " + acceptedID + ": " + Object.keys(Inventories[acceptedID].items));
				}
				$("#item-" + newItem.id).droppable( "enable" );
				
			}
		});
		
		$("#item-" + newItem.id).droppable({
				accept: '.item',
				greedy: true,
				hoverClass: "drop-not-allowed-hover",
				tolerance: "touch",
				
				drop: function( event, ui ) {
					ui.draggable.draggable( "option", "revert", true );
					debug("not allowed");
				},
				
				over: function( event, ui ) {
					ui.helper.css({'border-color': 'red'})
				},
				
				out: function( event, ui ) {
					ui.helper.css({'border-color': 'black'})
				}
		});
	}
	
	this.addItem = function(newItem){
		canAddItem = true;
		// check if new newItem can be added		
		if( (this.currentWeight + newItem.weight) > (this.maxWeight) ){
			canAddItem = false;
			debug("is full");
		}
		if (canAddItem){			
			// add to html
			this.addItemsHTML(newItem);
			// add to dict
			this.items[newItem.id] = newItem;
		}		
	}
	
	this.removeItem = function(itemID){
		var inventoryDIV = $('#inventory-'+this.id);
		inventoryDIV.find('#item-' + itemID).remove();
		delete this.items[itemID];		
	}
	
	this.createHTML = function() {
		var inventoryId = this.id;
		debug('creating inventory HTML');
		invWrapper = $('<div>', {
			id: 'inventory-'+inventoryId,
			class: 'inventory'
		});
		if  (this.position.x == null){
			invWrapper.css({ "left": (inventoryId*20+25)+"px" });
		}
		if (this.position.y == null){
			invWrapper.css({ "top": (inventoryId*20+25)+"px" });
		}
		invWrapper.css({"min-width": this.size.width+"px"});
		
		invHeader = $('<div>', {
			class: 'invHeader'
		});
		invHeader.html('<div class="invTitle">' + this.name + '</div>');
		invControls = $('<div>', {
			class: 'invControls'
		});
		invControls.html('<div class="btnClose" onclick="closeInv(' + inventoryId + ')"></div><div class="btnMinimize" onclick="minimizeToggle(' + this.id + ')"></div>');
		invHeader.append(invControls);
		invWrapper.append(invHeader);		
		
		invContent = $('<div>', {
			class: 'invContent'
		});
		invContent.css({"width": this.size.width, "height": this.size.height});
		invWrapper.append(invContent);
		
		this.html = invWrapper;
		$('body').append(this.html);
		invWrapper.css({"min-height":invHeader.height()+"px", "height": (invContent.height() + invHeader.height())+"px", "width": (invHeader.width())+"px"});
		invContent.css({"top": invHeader.height()+"px"});
		var inventoryDIV = $('#inventory-'+inventoryId);
		
		this.position.x = inventoryDIV.offset().left;
		this.position.y = inventoryDIV.offset().top;
		
		//droppable+dragable functionality
		//----------------------------------------------
		inventoryDIV.draggable({ 
				addClasses: false,
				stop: function( event, ui ) {
					Inventories[inventoryId].setPosition(new Position(inventoryDIV.offset().left, inventoryDIV.offset().top));
				}
			});
		inventoryDIV.droppable({
				accept: '.item',
				addClasses: false,
				hoverClass: "drop-hover",
				tolerance: "fit",				
				drop: function( event, ui ) {
					debug("item dropped");
					$(this).addClass('accepted');
				},
				activate: function( event, ui ) {
					//debug(inventoryId + " activated");
				},
				deactivate: function( event, ui ) {
				
				},
				out: function( event, ui ) {
				
				},			
				over: function( event, ui ) {
					//debug("im over" + inventoryId);
				}
			});
		//----------------------------------------------
		// fill html with items sent at initialisation
		if (Object.keys(items).length > 0){
			canAddHTML = true;
			if(inventoryDIV.length == 0){
				canAddHTML = false;
			}
			if (canAddHTML){
				keys = Object.keys(items);
				for (key in keys){
					this.addItemsHTML(inventoryDIV, items[key].html);
				}
			}
		}
	}
}	


function inventoryItem(id, name, position, size, weight, inventoryId) {
	this.id = id;
	this.name = name;
	this.position = position;
	this.size = size;
	this.weight = weight;
	this.html = '';
	
	// functions and methods
	this.getSize = function() {
		return this.size;
	}
	
	this.setSize = function(size) {
		this.size = size;
	}
	
	this.getPosition = function() {
		return this.position;
	}
	
	this.setPosition = function(position) {
		this.position = position;
		$('#item-'+this.id).css({"left": this.position.x + "px", "top": this.position.y+"px"});
	}
	
	this.createHTML = function() {
		itemWrapper = $('<div>', {
			id: 'item-'+this.id,
			class: 'item'
		});
		itemWrapper.css({"left": this.position.x + "px", "top": this.position.y+"px", "min-width": this.size.width});
		
		itemContent = $('<div>', {
			class: 'itemContent'
		});
		/* rnd color generator http://snipplr.com/view/59637/*/
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.round(Math.random() * 15)];
		}
		
		itemContent.css({"width": this.size.width, "height": this.size.height, "background-color":color});
		itemContent.html(this.name);
		itemWrapper.append(itemContent);
		this.html = itemWrapper;
	}
	
	this.overlapsWith = function(position, size){
		debug("my position " + this.position);
		debug("got position " + position);
		var xOverlap = false;
		var yOverlap = false;
		if (((this.position.x >= position.x) && (this.position.x <= position.x + size.width))||
			((position.x >= this.position.x) && (position.x <= this.position.x + this.size.width))){
			xOverlap = true;
			debug('xOverlap true');
		}
		if (((this.position.y >= position.y) && (this.position.y <= position.y + size.height))||
			((position.y >= this.position.y) && (position.y <= this.position.y + this.size.height))){
			yOverlap = true;
			debug('yOverlap true');
		}
		
		return (xOverlap && yOverlap);
	}
	
	this.toString = function(){
		return('Item id: ' + this.id + ', position: ' + this.position + ', size: ' + this.size);
	}
}

function addNewInventory()
{	
	//trying to assign smallest id possible
	var newId = 0;
	for (inventar in Inventories){		
		if (typeof Inventories[newId] === "undefined"){
			break;
		}
		else{
			newId++;
		}
	}	
	newName = 'Inventory ' + newId;
	newPosition = new Position();
	var invWidth = Math.round(200 + Math.round(Math.random()*50)*5);
	var invHeight = Math.round(80 + Math.round(Math.random()*80)*5);
	newSize = new Size(invWidth, invHeight);
	newMaxWeight = 50;
	newVolume = 25;
	newItems = {};
	debug("adding new inventory: id=" + newId + ", name='" + newName + "'");
	newInventory = new inventory(newId, newName, newPosition, newSize, newMaxWeight, newVolume, newItems);
	Inventories[newId] = newInventory;
	newInventory.createHTML();
	$("<option/>").val(newId).text(newId).appendTo("#invSelect");
}

function addNewItem(inventoryId)
{
	//var inverntoryDIV = $('#inventory-' + inventoryId);
	var inventory = Inventories[inventoryId];
	
	newItemId = itemId++;
	newItemName = 'Item No' + newItemId;
	newItemPosition = new Position();
	var itemWidth = (40 + Math.round(Math.random()*4)*5);
	var itemHeight = (40 + Math.round(Math.random()*8)*5);
	newItemSize = new Size(itemWidth, itemHeight);
	newItemWeight = 0.9;	
	newItem = new inventoryItem(newItemId, newItemName, newItemPosition, newItemSize, newItemWeight, inventoryId);	
	inventory.addItem(newItem);
	//newItem.createHTML();
	//var newItemDIV = $('#inventory-'+newItemId);
}

function closeInv(id){	
	var inverntoryDIV = $('#inventory-' + id);
	inverntoryDIV.remove();
	delete Inventories[id];	
	//
	 $("#invSelect option[value='"+id+"']").remove();
}

function minimizeToggle(id){
	var inverntoryDIV = $('#inventory-' + id);	
	var invContent = inverntoryDIV.find('.invContent');
	var invHeader = inverntoryDIV.find('.invHeader');
	var button = inverntoryDIV.find('.btnMinimize');
	button.toggleClass('restore');
	invContent.toggle();
	
	if (invContent.is(':visible')){
		inverntoryDIV.css({"height": (invContent.height() + invHeader.height())+"px"});
	}else{
		inverntoryDIV.css({"height": (invHeader.height())+"px"});
	}
}
// Not implemented, experimental features
function freeArea(top, bottom, left, right){
	this.top = parseInt(top);
	this.bottom = parseInt(bottom);
	this.left = parseInt(left);
	this.right = parseInt(right);
	
	this.key = undefined;
	
	this.setKey = function(key){
		this.key = parseInt(key);
	}
	
	this.toString = function(){
		return ("Area: top: " + this.top + ", left: " + this.left + ", bottom: " + this.bottom + ", right: " + this.right + ".");
	}
	
	this.setTop = function(top){
		this.top =  parseInt(top);
	}
	
	this.setBottom = function(bottom){
		this.bottom =  parseInt(bottom);
	}
	
	this.setLeft = function(left){
		this.left =  parseInt(left);
	}
	
	this.setRight = function(right){
		this.right =  parseInt(right);
	}
}

function freeAreas(){
	this.tops = {};
	this.bottoms = {};
	this.lefts = {};
	this.rights = {};
	this.keys = {};
	
	this.addFreeArea = function (area){
		var newKey = Object.keys(this.keys).length;		
		this.keys[newKey] = newKey;
		
		if ( area.top in this.tops){
			this.tops[area.top].push(newKey);			
		}else{
			this.tops[area.top] = [];
			this.tops[area.top].push(newKey);
		}
		
		if (area.bottom in this.bottoms){
			this.bottoms[area.bottom].push(newKey);
		}else{
			this.bottoms[area.bottom] = [newKey];
		}
		
		if (area.left in this.lefts){
			this.lefts[area.left].push(newKey);
		}else{
			this.lefts[area.left] = [newKey];
		}
		
		if (area.right in this.rights){
			this.rights[area.right].push(newKey);
		}else{
			this.rights[area.right] = [newKey];
		}
	}
	
	this.toString = function(){
		for (key in this.keys){
			var area = this.getFreeArea(key);
			debug("Area " + key + ": [" + area.top + "|" + area.left + "], [" + area.bottom + "|" + area.right + "]");
		}
	}
	
	this.getBottomNeighbours = function(area){
		var neighbours = [];
		if (area.bottom in this.tops){
			//debug(this.tops[area.bottom]);
			neighboursKeys = this.tops[area.bottom]; // possible neighbours
			for (var i = 0; i < neighboursKeys.length; i++){
				var key = neighboursKeys[i];
				var newArea = this.getFreeArea(key);
				// test area if really neighbour:
				if (((newArea.left >= area.left) && (newArea.left <= area.right))||
					((area.left >= newArea.left) && (area.left <= newArea.right))){
					
					neighbours.push(newArea);
				}
			}
		}
		return neighbours;
	}
	
	this.getFreeArea = function(key){
		var valueTop = undefined;
		var valueBottom = undefined;
		var valueLeft = undefined;
		var valueRight = undefined;
		
		topKeys = Object.keys(this.tops);
		for (var i = 0; i < topKeys.length; i++){
			if ($.inArray(parseInt(key), this.tops[topKeys[i]])>=0){
				valueTop = topKeys[i];
				break;
			}
		}
		bottomKeys = Object.keys(this.bottoms);
		for (var i = 0; i < bottomKeys.length; i++){
			if ($.inArray(parseInt(key), this.bottoms[bottomKeys[i]])>=0){
				valueBottom = bottomKeys[i];
				break;
			}
		}
		leftKeys = Object.keys(this.lefts);
		for (var i = 0; i < leftKeys.length; i++){
			if ($.inArray(parseInt(key), this.lefts[leftKeys[i]])>=0){
				valueLeft = leftKeys[i];
				break;
			}
		}
		rightKeys = Object.keys(this.rights);
		for (var i = 0; i < rightKeys.length; i++){
			if ($.inArray(parseInt(key), this.rights[rightKeys[i]])>=0){
				valueRight = rightKeys[i];
				break;
			}
		}		
		var newFreeArea = new freeArea(valueTop, valueBottom, valueLeft, valueRight);
		newFreeArea.setKey(key);
		return newFreeArea;
	}
	
	this.getFreeAreas = function (){
		var freeAreas = [];
		for (key in this.keys){
			var area = this.getFreeArea(key);
			freeAreas.push(area);
		}
		return freeAreas;
	}
	
	this.removeFreeArea = function (key){
		if (key in this.keys){
			topKeys = Object.keys(this.tops);
			for (var i = 0; i < topKeys.length; i++){
				if ($.inArray(parseInt(key), this.tops[topKeys[i]])>=0){
					this.tops[topKeys[i]] = this.tops[topKeys[i]].splice(parseInt(key), 1);
					break;
				}
			}
			bottomKeys = Object.keys(this.bottoms);
			for (var i = 0; i < bottomKeys.length; i++){
				if ($.inArray(parseInt(key), this.bottoms[bottomKeys[i]])>=0){
					this.bottoms[bottomKeys[i]] = this.bottoms[bottomKeys[i]].splice(parseInt(key), 1);
					break;
				}
			}
			leftKeys = Object.keys(this.lefts);
			for (var i = 0; i < leftKeys.length; i++){
				if ($.inArray(parseInt(key), this.lefts[leftKeys[i]])>=0){
					this.lefts[leftKeys[i]] = this.lefts[leftKeys[i]].splice(parseInt(key), 1);
					break;
				}
			}
			rightKeys = Object.keys(this.rights);
			for (var i = 0; i < rightKeys.length; i++){
				if ($.inArray(parseInt(key), this.rights[rightKeys[i]])>=0){
					this.rights[rightKeys[i]] = this.rights[rightKeys[i]].splice(parseInt(key), 1);
					break;
				}
			}
			delete this.keys[parseInt(key)];
		}
	}

	// getFFAC :D
	this.getFirstFitAreaCluster = function (sizeConstraint){
		sizeConstraint = typeof sizeConstraint !== 'undefined' ?  sizeConstraint : new Size(50,30); // default param
		var areasClone = $.extend(true, {}, this);		
		
		var getFirstFitArea = function (area){
			var firstFitArea = $.extend(true, {}, area);
			
			var hasNeighbours = areasClone.getBottomNeighbours(area).length > 0 ? true : false;
			var areaHeightFits = (firstFitArea.bottom - firstFitArea.top) >= sizeConstraint.height ? true : false;
			var areaWidthFits = (firstFitArea.right - firstFitArea.left) >= sizeConstraint.width ? true : false;
			
			while (hasNeighbours && !areaHeightFits && areaWidthFits){				
				var neighbour = areasClone.getBottomNeighbours(area)[0];
				
				maxLeft = Math.max(neighbour.left, firstFitArea.left);
				minRight = Math.min(neighbour.right, firstFitArea.right);
				firstFitArea.left = maxLeft;
				firstFitArea.right = minRight;
				firstFitArea.bottom = neighbour.bottom;
				
				area = neighbour;
				
				hasNeighbours = areasClone.getBottomNeighbours(area).length > 0 ? true : false;
				areaHeightFits = (firstFitArea.bottom - firstFitArea.top) >= sizeConstraint.height ? true : false;
				areaWidthFits = (firstFitArea.right - firstFitArea.left) >= sizeConstraint.width ? true : false;
			}
			
			if (areaHeightFits && areaWidthFits){
				//debug("(firstFitArea.right - firstFitArea.left): " + (firstFitArea.right - firstFitArea.left) + "; sizeConstraint.height: " + sizeConstraint.height);
				return firstFitArea;
			}			
			return false;
		}
		
		var myAreas = areasClone.getFreeAreas();
		for (var i = 0; i < myAreas.length; i++){	
			//debug("for " + myAreas[i]);
			var firstFitArea = getFirstFitArea(myAreas[i]);
			if (firstFitArea){
				debug("first fit area for constraint: " + sizeConstraint + " found at: " + firstFitArea);
				draw(firstFitArea.left, firstFitArea.top, sizeConstraint.width, sizeConstraint.height, "rgb(0,200,0)");
				draw(firstFitArea.left, firstFitArea.top, (firstFitArea.right-firstFitArea.left), (firstFitArea.bottom-firstFitArea.top), "rgb(200,0,0)");
				break;
			}
		}
		delete areasClone;
	}
}

function testAreas(){
	debug ('');
	var newAreas = new freeAreas();
	
	if ($('#myCanvas').length == 0){
		canvas = $('<canvas>', {id: 'myCanvas', width: '300', height: '400'});
		canvas.css({'border':'1px solid black', 'position': 'absolute', 'top': '15px', 'left': '350px'});
		$('body').append(canvas);
	}else{
		$('#myCanvas').remove();
		canvas = $('<canvas>', {id: 'myCanvas', width: '300', height: '400'});
		canvas.css({'border':'1px solid black', 'position': 'absolute', 'top': '15px', 'left': '350px'});
		$('body').append(canvas);
	}
	var previousBottom = 0;
	for (i = 0; i < 20; i++){		
		var valueTop = previousBottom;
		//var valueTop = Math.round((i * 10));
		var valueBottom = valueTop + 1 + Math.round(Math.random()*15);
		previousBottom = valueBottom;
		//var valueBottom = valueTop + 10;
		var valueLeft = Math.round(Math.random()*50);
		//var valueLeft = 0;
		var valueRight = valueLeft + 1 + Math.round(Math.random()*100);
		//var valueRight = valueLeft + 10;
		var newArea = new freeArea(valueTop, valueBottom, valueLeft, valueRight);
		newAreas.addFreeArea(newArea);
		//debug("Area " + i + ": [" + valueTop + "|" + valueLeft + "], [" + valueBottom + "|" + valueRight + "]");
		draw(valueLeft, valueTop, (valueRight - valueLeft), (valueBottom - valueTop), "rgb(0,0,0)");
	}
	newAreas.toString();
	/*var myAreas = newAreas.getFreeAreas();
	for (var i = 0; i < myAreas.length; i++){
		var neighbours = newAreas.getBottomNeighbours(myAreas[i]);
		if (neighbours.length){
			for (var c = 0; c < neighbours.length; c++){
				debug(myAreas[i].toString() + " has bottom neighbour: " + neighbours[c].toString());
			}
		}else{
			debug(myAreas[i].toString() + " has no bottom neighbours");
		}
	}*/
	newAreas.getFirstFitAreaCluster(new Size((1 + Math.round(Math.random()*50)),(1 + Math.round(Math.random()*50))));	
}

function draw(x, y, width, height, color){
	var canvas = $('#myCanvas')[0];
	if (canvas.getContext){
		canvas = canvas.getContext('2d');
		canvas.lineWidth = 1.0;
		canvas.strokeStyle = color;
		canvas.strokeRect( x, y, width, height );
	}
}