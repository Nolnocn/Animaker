// frameImage.js

"use strict";

var app = app || {};

/*
 * "Class" for an image in a frame
 */
app.FrameImage = function() {
    /* Function constructor
     * image = an actual image
     * x = x position of image in frame
     * y = y position of image in frame
     * w = width of image in frame
     * h = height of image in frame
     */
    function FrameImage(image, x, y, w, h) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    };
    
    var p = FrameImage.prototype;
    
    // Checks if the image is clicked
    p.isClicked = function(mouse) {
        if(mouse.x > this.x && mouse.x < this.x + this.w && mouse.y > this.y && mouse.y < this.y + this.h) {
            return true;
        }
        return false;
    };
    
    // Draws the image at its position and dimensions
    p.draw = function(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
    };
    
    return FrameImage;
}();