"use strict";
var app = app || {};

// utility functions
app.utils = function(){
    
    // gets the mouse position relative to the canvas
    function getMouse(e){
		var mouse = {};
        var div = e.target.parentNode; // probably unnecessary since we don't have the canvas in a div anymore...
        if(div) {
            mouse.x = e.pageX - (e.target.offsetLeft + div.offsetLeft);
            mouse.y = e.pageY - (e.target.offsetTop + div.offsetTop);
        }
        else {
            mouse.x = e.pageX - e.target.offsetLeft;
            mouse.y = e.pageY - e.target.offsetTop;
        }
		return mouse;
	}
    
    return{
		getMouse : getMouse
	};
}(); 