// import.js

"use strict";

var app = app || {};

// Sets up the drag and drop functionality
app.import = {
    workArea: undefined,
    
    // initialize
    init: function() {
        this.setUpDragDropAndLoad(this.workArea.canvas);
    },
    
    // sets up the events for dragging and dropping into thwe work area
    // adapted from visualizer drag and drop
    setUpDragDropAndLoad: function(dropTarget) {
        var that = this;
        
        dropTarget.addEventListener("dragover", function(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            dropTarget.classList.add('over');
        });
    
        dropTarget.addEventListener('drop', function(e) {
            e.stopPropagation();
            e.preventDefault();
            that.loadFile(e.dataTransfer.files[0]);
            dropTarget.classList.remove('over');
        });
        
        dropTarget.addEventListener('dragleave', function(e) {
            dropTarget.classList.remove('over');
        });
    },
    
    // loads and image file and adds it to the work area
    loadFile: function(fileObject){
        var that = this;
        var reader = new FileReader();
        
        reader.addEventListener("load", function(e) {
            var image = new Image();
            image.onload = function() {
                that.workArea.addImage(image);
            };
            image.src = e.target.result;
        });
        
        reader.readAsDataURL(fileObject);
    }
};