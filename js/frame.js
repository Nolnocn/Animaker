// frame.js

"use strict";

var app = app || {};

/*
 * "Class" that holds data for saving, loading, and drawing frames
 */
app.Frame = function() {
    // Function constructor
    // images = images in frame
    // w = width of work area
    // h = height of work area
    function Frame(images, w, h) {
        this.images = images;
        this.thumbnail = undefined;
        this.createThumbnail(w, h);
    };
    
    var p = Frame.prototype;
    
    // creates an image for the frame
    p.createThumbnail = function(w, h) {
        var tempCanvas, tempCtx, dataURL, newImg;
        tempCanvas = document.createElement("canvas");
        tempCanvas.width = w;
        tempCanvas.height = h;
        tempCtx = tempCanvas.getContext("2d");
        
        this.images.forEach(function(img) {
            tempCtx.drawImage(img.image, img.x, img.y, img.w, img.h);
        }, this);
        
        dataURL = tempCanvas.toDataURL("image/png");
        this.thumbnail = new Image();
        this.thumbnail.src = dataURL;
    },
    
    // draws the frame thumbnail for use in the timeline and when playing
    p.drawFrame = function(ctx) {
        ctx.drawImage(this.thumbnail, 0, 0);
    };
    
    return Frame;
}();