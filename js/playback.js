// playback.js

"use strict";

var app = app || {};

// Handles the timeline and playback of frames
app.playback = {
    canvas: undefined,
    ctx: undefined,
    overlayImg: undefined,
    workArea: undefined,
    utils: undefined,
    scrollbar: undefined,
    frames: [],
    playing: false,
    playRate: 1/12,
    playTime: 0,
    playIndex: 0,
    loop: false,
    
    // initialize
    init: function() {
        this.canvas = document.querySelector('#timeline');
        this.ctx = this.canvas.getContext('2d');
        this.scrollbar.init(10, this.canvas.height - 20, this.canvas.width - 20, 10);
        // set up button controls
        document.querySelector("#playButton").onclick = this.togglePlay.bind(this);
        
        var that = this;
        // back button
        document.querySelector("#backwardButton").onclick = function() {
            that.setSelectedFrame(that.playIndex - 1);
        };
        document.querySelector("#backwardButton").onmousedown = function() {
            document.querySelector("#backwardButtonImg").src = "images/buttonRewindClicked.png";
        };
        document.querySelector("#backwardButton").onmouseup = function() {
            document.querySelector("#backwardButtonImg").src = "images/buttonRewind.png";
        };
        document.querySelector("#backwardButton").onmouseout = function() {
            document.querySelector("#backwardButtonImg").src = "images/buttonRewind.png";
        };
        
        // forward button
        document.querySelector("#forwardButton").onclick = function() {
            that.setSelectedFrame(that.playIndex + 1);
        };
        document.querySelector("#forwardButton").onmousedown = function() {
            document.querySelector("#forwardButtonImg").src = "images/buttonFastForwardClicked.png";
        };
        document.querySelector("#forwardButton").onmouseup = function() {
            document.querySelector("#forwardButtonImg").src = "images/buttonFastForward.png";
        };
        document.querySelector("#forwardButton").onmouseout = function() {
            document.querySelector("#forwardButtonImg").src = "images/buttonFastForward.png";
        };
        
        document.querySelector("#loopCheckbox").onchange = function(e) {
            that.loop = e.target.checked;
        };
        
        document.querySelector("#framerate").onchange = function(e) {
            that.playRate = 1 / e.target.value;
        };
        
        var that = this;
        this.canvas.addEventListener("mousedown", function(e) {
            e.preventDefault();
            var mouse = that.utils.getMouse(e);
            that.scrollbar.checkifClicked(mouse);
        }, false);
        
        this.canvas.addEventListener("mousemove", function(e) {
            e.preventDefault();
            var mouse = that.utils.getMouse(e);
            that.scrollbar.constrainToMouse(mouse);
            
            if(that.scrollbar.dragging) {
                var i = 30 + 6 * that.playIndex + 60 * that.playIndex - that.scrollbar.value * (that.frames.length-10) * 66;
                // if the selected frame is off screen, change the selected frame
                if(i < 0) {
                    that.playIndex++;
                    that.workArea.loadFrame(that.frames[that.playIndex]);
                }
                else if(i > that.canvas.width - 60) {
                    that.playIndex--;
                    that.workArea.loadFrame(that.frames[that.playIndex]);
                }
            }
        }, false);
        
        this.canvas.addEventListener("mouseup", function(e) {
            e.preventDefault();
            that.scrollbar.released();
        }, false);
        
        this.canvas.addEventListener("mouseout", function(e) {
            e.preventDefault();
            that.scrollbar.released();
        }, false);
    },
    
    // updates then calls draw
    updateAndDraw: function(dt) {
        if(this.playing) {
            // if playing, play the frames
            this.playFrames(dt);
        }
        
        this.drawTimeline();
    },
    
    // draws the frames in the timeline
    drawTimeline: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var count = this.frames.length;
        var y = 25;
        var w = 60;
        var h = 40;
        // draw each frame
        for(var i = 0; i < count; i++){
            this.ctx.save();
            if(i == this.playIndex) this.ctx.strokeStyle = '#bada55'; // highlight selected frame
            
            var x = 30 + 6 * i + 60 * i;
            
            if(count <= 10) {
                this.ctx.drawImage(this.frames[i].thumbnail, x, y + 5, w, h);
                this.ctx.strokeRect(x, y + 5, w, h);
            }
            else {
                var val = this.scrollbar.value;
                x -= val * (count-10) * 66;
                this.ctx.drawImage(this.frames[i].thumbnail, x, y, w, h);
                this.ctx.strokeRect(x, y, w, h);
                this.scrollbar.draw(this.ctx);
            }
            this.ctx.restore();
        }
        
        this.ctx.drawImage(this.overlayImg, 0, 0);
    },
    
    // add a new frame to the end of the array
    addFrame: function(frame) {
        this.frames.push(frame);
        this.playIndex = this.frames.length - 1;
        this.workArea.loadFrame(this.frames[this.playIndex]);
        this.scrollbar.scaleBox(this.frames.length);
    },
    
    // remove a frame from the array
    removeFrame: function(index) {
        if(this.frames.length > 0) {
            this.frames.splice(index, 1);
            this.playIndex--;
            if(this.playIndex < 0) {
                this.playIndex = 0;
            }
            if(this.frames.length > 1) {
                this.workArea.loadFrame(this.frames[this.playIndex]);
            }
            else {
                this.workArea.clearWorkArea();
            }
            this.scrollbar.scaleBox(this.frames.length);
        }
    },
    
    // inserts a new frame to the array at the selected index
    insertFrame: function(frame, index) {
        this.frames.splice(index, 0, frame);
        this.playIndex++;
        this.workArea.loadFrame(this.frames[this.playIndex]);
        this.scrollbar.scaleBox(this.frames.length);
    },
    
    // toggles the animation playback
    togglePlay: function() {
        // if there are 0-1 frames, don't play
        if(this.frames.length <= 1) {
            this.playing = false;
            return;
        }
        
        // toggle play and reset playTime
        this.playing = !this.playing;
        this.playTime = 0;
        
        // change the play button appearance
        if(!this.playing) {
            document.querySelector('#playButtonImg').src = "images/buttonPlay.png";
            
            document.querySelector("#playButton").onmousedown = function() {
                document.querySelector("#playButtonImg").src = "images/buttonPlayClicked.png";
            };
            document.querySelector("#playButton").onmouseup = function() {
                document.querySelector("#playButtonImg").src = "images/buttonPlay.png";
            };
            document.querySelector("#playButton").onmouseout = function() {
                document.querySelector("#playButtonImg").src = "images/buttonPlay.png";
            };
            
            // load the current frame when playback is stopped
            this.workArea.loadFrame(this.frames[this.playIndex]);
        }
        else {
            document.querySelector('#playButtonImg').src = "images/buttonPause.png";
            
            document.querySelector("#playButton").onmousedown = function() {
                document.querySelector("#playButtonImg").src = "images/buttonPauseClicked.png";
            };
            document.querySelector("#playButton").onmouseup = function() {
                document.querySelector("#playButtonImg").src = "images/buttonPause.png";
            };
            document.querySelector("#playButton").onmouseout = function() {
                document.querySelector("#playButtonImg").src = "images/buttonPause.png";
            };
        }
    },
    
    // loops through and displays the frames over time
    playFrames: function(dt) {
        // clear the workArea and draw the current frame
        this.workArea.ctx.clearRect(0, 0, this.workArea.WIDTH, this.workArea.HEIGHT);
        this.frames[this.playIndex].drawFrame(this.workArea.ctx);
        
        // check the playTime
        if(this.playTime >= this.playRate) {
            // when playTime >= playRate, advance the frame
            if(this.loop) {
                // if looping, wrap the index back to 0
                this.playIndex = (this.playIndex + 1) % this.frames.length;
            }
            else {
                // else, advance until end...
                this.playIndex++;
                if(this.playIndex >= this.frames.length) {
                    // ... then stop
                    this.playIndex = 0;
                    this.togglePlay();
                }
            }
            // reset playTime for next frame
            this.playTime = 0;
        }
        else {
            // when playTime < playRate, increase playTime by dt
            this.playTime += dt;
        }
        
        // Also, draw the workArea border over the frame
        this.workArea.ctx.drawImage(this.workArea.overlayImg, 0, 0);
    },
    
    // sets the selected frame to n
    setSelectedFrame: function(n) {
        var len = this.frames.length;
        if(len > 0) {
            // wraps >len and <0
            this.playIndex = ((n % len) + len) % len;
            // loads the selected frame
            this.workArea.loadFrame(this.frames[this.playIndex]);
        }
    },
    
    // recreates the thumbnails of all the frames
    updateThumbnails: function() {
        for(var i = 0, len = this.frames.length; i < len; i++) {
            this.frames[i].createThumbnail(this.workArea.WIDTH, this.workArea.HEIGHT);
        }
    }
};