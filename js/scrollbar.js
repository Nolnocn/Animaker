// scrollbar.js

"use strict";

var app = app || {};

app.scrollbar = {
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
    boxX: undefined,
    boxY: undefined,
    boxWidth: undefined,
    boxHeight: undefined,
    value: undefined,
    defaultColor: undefined,
    clickedColor: undefined,
    bgColor: undefined,
    dragging: false,
    mouseOffset: undefined,
    
    init: function(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.boxX = x;
        this.boxY = y;
        this.boxWidth = w;
        this.boxHeight = h;
        this.defaultColor = 'rgba(50, 50, 50, .8)';
        this.clickedColor = 'rgba(0, 0, 0, .8)';
        this.bgColor = 'rgba(200, 200, 200, .8)';
        this.value = 0;
        
        this.scaleBox.bind(this);
        this.checkifClicked.bind(this);
        this.released.bind(this);
        this.constrainToMouse.bind(this);
    },
    
    update: function() {
    },
    
    draw: function(ctx) {
        ctx.save();
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if(!this.dragging) {
            ctx.fillStyle = this.defaultColor;
        }
        else {
            ctx.fillStyle = this.clickedColor;
        }
        ctx.fillRect(this.boxX, this.boxY, this.boxWidth, this.boxHeight);
        ctx.restore();
    },
    
    scaleBox: function(amt) {
        if(amt <= 10) {
            this.boxWidth = this.width;
        }
        else {
            var percent = 10 / amt;
            this.boxWidth = this.width * percent;
            this.boxX = Math.min(this.x + this.width - this.boxWidth, this.boxX);
        }
    },
    
    calculateValue: function() {
        this.value = (this.boxX - this.x) / (this.x + this.width - this.boxWidth);
        if(this.boxX == this.x + this.width - this.boxWidth) {
            this.value = 1.0;
        }
    },
    
    checkifClicked: function(mouse) {
        if(mouse.x > this.boxX && mouse.x < this.boxX + this.boxWidth 
           && mouse.y > this.boxY && mouse.y < this.boxY + this.boxHeight) {
            this.dragging = true;
            this.mouseOffset = mouse.x - this.boxX;
        }
    },
    
    released: function() {
        this.dragging = false;
    },
    
    constrainToMouse: function(mouse) {
        if(this.dragging) {
            this.boxX = Math.min(this.x + this.width - this.boxWidth, Math.max(this.x, mouse.x - this.mouseOffset));
            this.calculateValue();
        }
    }
};