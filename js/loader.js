// loader.js

"use strict";

var app = app || {};

// image src's
app.IMAGES = {
    workArea: "images/workArea.png",
    timeline:  "images/timeline.png"
}

app.KEYBOARD = {
    "SHIFT": 16,
    "BACKSPACE": 8,
    "DELETE": 46,
    "OPEN_BRACKET": 219,
    "CLOSE_BRACKET": 221,
    "EQUAL": 187,
    "DASH": 189,
    "KEY_LEFT": 37,
    "KEY_UP": 38,
    "KEY_RIGHT": 39,
    "KEY_DOWN": 40
};

// Key Daemon
app.keydown = {};

// loads the images using a homemade loader
app.loadImages = function() {
    var imageCount = 0, loadedImages = 0;
    // loops through all images
    for(var key in app.IMAGES) {
        imageCount++;
        // create a new image
        var image = new Image();
        image.onload = function() {
            // once it's loaded, check if all images are loaded
            loadedImages++;
            if(loadedImages == imageCount) {
                // if all images are loaded, init
                app.init();
            }
        };
        image.src = app.IMAGES[key];
        app.IMAGES[key] = image;
    }
}

// initialize usual loader stuff
app.init = function() {
    // playback
    var playback = app.playback;
    playback.overlayImg = app.IMAGES["timeline"];
    playback.workArea = app.workArea;
    playback.utils = app.utils;
    playback.scrollbar = app.scrollbar;
    
    // workArea
    var workArea = app.workArea;
    workArea.playback = playback;
    workArea.utils = app.utils;
    workArea.Frame = app.Frame;
    workArea.FrameImage = app.FrameImage;
    workArea.overlayImg = app.IMAGES["workArea"];
    
    // importer
    var importer = app.import;
    importer.workArea = workArea;
    
    // animaker
    var animaker = app.animaker;
    animaker.workArea = workArea;
    animaker.playback = playback;
    animaker.import = importer;
    animaker.init();
}

// set up window events
app.setupEventListeners = function() {
    // stop drag and drop from opening image file
    window.addEventListener('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    
    window.addEventListener("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
    });
    
    window.addEventListener("keydown", function(e) {
        app.keydown[e.keyCode] = true;
        if(e.keyCode == app.KEYBOARD.SHIFT) {
            app.workArea.enableConstrain();
        }
        if(e.keyCode == app.KEYBOARD.KEY_UP) {
            app.workArea.nudge(0, -1);
        }
        else if(e.keyCode == app.KEYBOARD.KEY_DOWN) {
            app.workArea.nudge(0, 1);
        }
        else if(e.keyCode == app.KEYBOARD.KEY_LEFT) {
            app.workArea.nudge(-1, 0);
        }
        else if(e.keyCode == app.KEYBOARD.KEY_RIGHT) {
            app.workArea.nudge(1, 0);
        }
    });
    
    window.addEventListener("keyup", function(e) {
        app.keydown[e.keyCode] = false;
        
        if(e.keyCode == app.KEYBOARD.SHIFT) {
            app.workArea.disableConstrain();
        }
        else if(e.keyCode == app.KEYBOARD.BACKSPACE || e.keyCode == app.KEYBOARD.DELETE) {
            app.workArea.deleteSelectedImage();
        }
        else if(e.keyCode == app.KEYBOARD.OPEN_BRACKET) {
            app.workArea.changeSortingOrder("backward");
        }
        else if(e.keyCode == app.KEYBOARD.CLOSE_BRACKET) {
            app.workArea.changeSortingOrder("forward");
        }
        else if(e.keyCode == app.KEYBOARD.EQUAL) {
            app.workArea.changeSortingOrder("front");
        }
        else if(e.keyCode == app.KEYBOARD.DASH) {
            app.workArea.changeSortingOrder("back");
        }
    });
    
    /*window.onbeforeunload = function() {
        return "All progress will be lost...";
    };*/
}

// when the window's loaded, do stuff
window.onload = function(){
    app.setupEventListeners();
    app.loadImages();
}