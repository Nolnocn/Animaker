// animaker.js

"use strict";

var app = app || {};

// Main loop and init-ifier
app.animaker = {
    app: undefined,
    import: undefined,
    playback: undefined,
    workArea: undefined,
    
    // initialize
    init: function(){
        this.playback.init();
        this.workArea.init();
        this.import.init();
        this.update();
    },
    
    // loop
    update: function(){
        requestAnimationFrame(this.update.bind(this));
        var dt = 1/60;
        // update the workArea and playback managers
        this.workArea.updateAndDraw(dt);
        this.playback.updateAndDraw(dt);
    }
};