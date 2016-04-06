// workArea.js

"use strict";

var app = app || {};

// Handles the manipulation and saving of frames in the workArea canvas
app.workArea = {
    canvas: undefined,
    ctx: undefined,
    WIDTH: undefined,
    HEIGHT: undefined,
    utils: undefined,
    playback: undefined,
    Frame: undefined,
    FrameImage: undefined,
    overlayImg: undefined,
    images: [],
    selectedImage: undefined,
    dragging: false,
    selectOffsetX: undefined,
    selectOffsetY: undefined,
    constrainAxis: false,
    startX: undefined,
    startY: undefined,
    selectedIndex: undefined,
    onionSkin: false,
    
    // initialize
    init: function() {
        this.canvas = document.querySelector('#workArea');
        this.ctx = this.canvas.getContext('2d');
        this.WIDTH = this.canvas.width;
        this.HEIGHT = this.canvas.height;
        
        // set up button controls
        //add frame
        document.querySelector("#addButton").onclick = this.createNewFrame.bind(this);
        document.querySelector("#addButton").onmousedown = function() {
            document.querySelector("#addButtonImg").src = "images/buttonAddFrameClicked.png";
        };
        document.querySelector("#addButton").onmouseup = function() {
            document.querySelector("#addButtonImg").src = "images/buttonAddFrame.png";
        };
        document.querySelector("#addButton").onmouseout = function() {
            document.querySelector("#addButtonImg").src = "images/buttonAddFrame.png";
        };
        
        //clear frame
        document.querySelector("#clearButton").onclick = this.clearWorkArea.bind(this);
        document.querySelector("#clearButton").onmousedown = function() {
            document.querySelector("#clearButtonImg").src = "images/buttonClearFrameClicked.png";
        };
        document.querySelector("#clearButton").onmouseup = function() {
            document.querySelector("#clearButtonImg").src = "images/buttonClearFrame.png";
        };
        document.querySelector("#clearButton").onmouseout = function() {
            document.querySelector("#clearButtonImg").src = "images/buttonClearFrame.png";
        };
        
        //remove frame
        document.querySelector("#removeButton").onclick = this.removeFrame.bind(this);
        document.querySelector("#removeButton").onmousedown = function() {
            document.querySelector("#removeButtonImg").src = "images/buttonRemoveFrameClicked.png";
        };
        document.querySelector("#removeButton").onmouseup = function() {
            document.querySelector("#removeButtonImg").src = "images/buttonRemoveFrame.png";
        };
        document.querySelector("#removeButton").onmouseout = function() {
            document.querySelector("#removeButtonImg").src = "images/buttonRemoveFrame.png";
        };
        
        document.querySelector("#onionCheckbox").onchange = this.toggleOnionSkin.bind(this);
        
        this.setupMouseEvents();
    },
    
    // sets up the mouse events to select, move, and deselect frameImages
    setupMouseEvents: function() {
        var that = this;
        
        // when the mouse is clicked...
        this.canvas.addEventListener("mousedown", function(e) {
            e.preventDefault();
            // ... if the animation isn't playing...
            if(!that.playback.playing) {
                var mouse = that.utils.getMouse(e);
                // ... check each frameImage to see if it's clicked
                // loop backwards to check the topmost drawn images first
                for(var i = that.images.length - 1; i >= 0; i--) {
                    if(that.images[i].isClicked(mouse)) {
                        // If the image is clicked, set it as the selected image
                        that.selectedImage = that.images[i];
                        that.selectedIndex = i;
                        
                        // change the cursor too for good measure
                        that.canvas.style.cursor = "move";
                        
                        // set the offset between the mouse and image position
                        that.selectOffsetX = mouse.x - that.selectedImage.x;
                        that.selectOffsetY = mouse.y - that.selectedImage.y;
                        
                        that.startX = that.selectedImage.x + that.selectedImage.w * 0.5;
                        that.startY = that.selectedImage.y + that.selectedImage.h * 0.5;
                        
                        that.dragging = true;
                        return;
                    }
                }
                
                that.releaseSelectedImage(true);
            }
        }, false);
        
        // when the mouse is moved...
        this.canvas.addEventListener("mousemove", function(e) {
            e.preventDefault();
            if(that.selectedImage && that.dragging) {
                // move the selected image, if there is one
                var mouse = that.utils.getMouse(e);
                that.moveSelectedImage(mouse.x, mouse.y);
            }
        }, false);
        
        // deselect the image when the mouse is released
        this.canvas.addEventListener("mouseup", function(e) {
            e.preventDefault();
            that.releaseSelectedImage(false);
        }, false);
        
        // deselect the image when the mouse moves out of the workArea
        this.canvas.addEventListener("mouseout", function(e) {
            e.preventDefault();
            that.dragging = false;
            that.releaseSelectedImage(true);
        }, false);
    },
    
    // moves the selected image relative to the specified x and y
    moveSelectedImage: function(x, y) {
        if(!this.constrainAxis) {
            this.selectedImage.x = x - this.selectOffsetX;
            this.selectedImage.y = y - this.selectOffsetY;
        }
        else {
            if(Math.abs(x - this.startX) >= Math.abs(y - this.startY)) {
                this.selectedImage.x = x - this.selectOffsetX;
                this.selectedImage.y = this.startY - this.selectedImage.h * 0.5;
            }
            else {
                this.selectedImage.x = this.startX - this.selectedImage.w * 0.5;
                this.selectedImage.y = y - this.selectOffsetY;
            }
        }
    },
    
    // enables single axis constraint when moving a frameImage
    enableConstrain: function() {
        this.constrainAxis = true;
    },
    
    // disables single axis constraint when moving a frameImage
    disableConstrain: function() {
        this.constrainAxis = false;
    },
    
    // deselects the selected image
    releaseSelectedImage: function(deselect) {
        if(this.selectedImage) {
            this.dragging = false;
            if(deselect) {
                this.selectedImage = undefined;
                this.selectedIndex = undefined;
            }
            this.canvas.style.cursor = "default";
            this.playback.updateThumbnails();
        }
    },
    
    // changes the drawing order of the selected image by a mode
    changeSortingOrder: function(mode) {
        if(this.selectedImage) {
            switch(mode) {
                case "back":
                    this.setImageOrder(0);
                    break;
                case "front":
                    this.setImageOrder(this.images.length - 1);
                    break;
                case "forward":
                    if(this.selectedIndex < this.images.length - 1) {
                        this.setImageOrder(this.selectedIndex + 1);
                    }
                    break;
                case "backward":
                    if(this.selectedIndex > 0) {
                        this.setImageOrder(this.selectedIndex - 1);
                    }
                    break;
            }
        }
    },
    
    // deletes selected image
    deleteSelectedImage: function() {
        this.images.splice(this.selectedIndex, 1);
        this.releaseSelectedImage(true);
        this.playback.updateThumbnails();
    },
    
    // sets the index of a the selected image's draw order
    setImageOrder: function(newIndex) {
        this.images.splice(this.selectedIndex, 1);
        this.images.splice(newIndex, 0, this.selectedImage);
        this.selectedIndex = newIndex;
        this.selectedImage = this.images[this.selectedIndex];
        this.playback.updateThumbnails();
    },
    
    // moves the selected image by x and y
    nudge: function(x, y) {
        this.selectedImage.x += x;
        this.selectedImage.y += y;
    },
    
    // updates and draws
    updateAndDraw: function(dt) {
        // if the animation isn't playing, draw
        if(!this.playback.playing) {
            this.draw();
        }
    },
    
    // draws the frameImages of the current frame
    draw: function(){
        // clear the workArea
        this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);
        
        if(this.onionSkin) {
            var pb = this.playback;
            this.ctx.save();
            //this.ctx.globalAlpha = 0.5;
            if(pb.playIndex > 0) {
                for(var i = pb.playIndex - 1; i >= 0; i--) {
                    this.ctx.globalAlpha = 0.3 * (i+1)/pb.playIndex; 
                    pb.frames[i].drawFrame(this.ctx);
                }
            }
            if(pb.playIndex < pb.frames.length - 1) {
                for(var i = pb.playIndex + 1; i < pb.frames.length; i++) {
                    this.ctx.globalAlpha = 0.3 * (pb.playIndex+1)/i; 
                    pb.frames[i].drawFrame(this.ctx);
                }
            }
            this.ctx.restore();
        }
        
        // draw images if there are any
        if(this.images.length > 0) {
            this.images.forEach(function(img) {
                if(img == this.selectedImage) {
                    this.ctx.strokeRect(img.x, img.y, img.w, img.h);
                }
                img.draw(this.ctx);
            }, this);
        }
        else {
            // if there are no images, draw some instructions
            this.ctx.save();
            this.ctx.font= "20px Indie Flower";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Drag an image here to begin", this.WIDTH * 0.5, this.HEIGHT * 0.5);
            this.ctx.restore();
        }
        
        // draw border after the images
        this.ctx.drawImage(this.overlayImg, 0, 0);
    },
    
    // adds a new frameImage to the current frame
    addImage: function(image){
        // scale the image to fit in the workArea, if necessary 
        var aspectRatio = image.width / image.height;
        
        if(image.width > this.WIDTH - 20) {
            image.width = this.WIDTH - 20;
            image.height = image.width / aspectRatio;
        }
        
        if(image.height > this.HEIGHT - 20) {
            image.height = this.HEIGHT - 20;
            image.width = image.height * aspectRatio;
        }
        
        // add the image to the array
        this.images.push(new this.FrameImage(image,
                                            (this.WIDTH - image.width) * 0.5,
                                            (this.HEIGHT - image.height) * 0.5,
                                            image.width, image.height));
        
        // update the thumbnail to show the new image
        this.playback.updateThumbnails();
        
        // if there are currently no frames, create a new one
        if(this.playback.frames.length == 0) {
            this.createNewFrame();
        }
    },
    
    // saves the workArea into a new frame on the timeline
    createNewFrame: function() {
        var pb = this.playback;
        // make sure the animation isn't playing
        if(!pb.playing) {
            // create a new array of frameImages
            var newImages = [];
            
            // copy the frameImages from the current frame to the new array
            for(var i = 0; i < this.images.length; i++) {
                var img = this.images[i];
                newImages.push(new this.FrameImage(img.image, img.x, img.y, img.w, img.h));
            }
            
            // create a new frame with the new array of frameImages
            var newFrame = new this.Frame(newImages, this.WIDTH, this.HEIGHT);
            
            // add the frame to the playback
            if(pb.playIndex == pb.frames.length - 1 || pb.frames.length == 0) {
                // if there are no frames or the selected frame is the last frame,
                // add the frame to the end
                pb.addFrame(newFrame);
            }
            else {
                // else, insert the new frame after the selected frame
                pb.insertFrame(newFrame, pb.playIndex + 1);
            }
        }
        /*else if(pb.frames.length >= 10){
            // temporary alert
            alert("This prototype only supports 10 frames :(");
        }*/
    },
    
    // sets the workArea images to the images of a frame
    loadFrame: function(frame) {
        this.images = frame.images;
    },
    
    // clear all images of the current frame
    clearWorkArea: function() {
        var pb = this.playback;
        if(!pb.playing) {
            this.images = [];
            if(pb.frames.length > 0) {
                pb.frames[pb.playIndex].images = this.images;
                pb.updateThumbnails();
            }
        }
    },
    
    // removes the current frame from the timeline
    removeFrame: function() {
        var pb = this.playback;
        if(!pb.playing) {
            pb.removeFrame(this.playback.playIndex);
        }
    },
    
    // toggles onion skin display on and off
    toggleOnionSkin: function() {
        this.onionSkin = !this.onionSkin;
    }
};