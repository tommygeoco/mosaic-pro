/*
Video Mosaic Wall Script
Creates a mosaic grid of videos in landscape or portrait orientation
Each video is contained in its own frame with optional center image reveal
*/

// Frame rate constant
var FRAME_RATE = 30;
var EXPECTED_VIDEO_COUNT = 77;
var IMAGE_REVEAL_DURATION = 3; // seconds
var CENTER_IMAGE_SIZE = 5; // 5x5 grid for center image (25 pieces)

// Main class
function VideoMosaicWall() {
    var self = this;
    var utils = new MosaicUtils();
    
    // Script info
    this.scriptName = "Video Mosaic Wall";
    this.scriptVersion = "1.0";
    
    // UI strings
    this.aboutText = this.scriptName + " v" + this.scriptVersion + "\n\n" +
        "Creates an 11x7 grid mosaic wall from video files.\n\n" +
        "Output: 3840x2160 @ 30fps\n" +
        "Duration: Customizable loop duration\n" +
        "Optional: Staggered reveal effect (videos snap out)\n" +
        "Optional: Center image reveal (5x5 grid)\n" +
        "Each video is scaled to fill its container.\n\n" +
        "Usage:\n" +
        "1. Select a folder with 77 videos (+ optional 1 image)\n" +
        "2. Set desired loop duration\n" +
        "3. Optionally enable staggered reveal effect\n" +
        "4. Click 'Create Mosaic Wall'\n\n" +
        "Center Image Feature:\n" +
        "- Add a .jpg or .png image to your folder (optional)\n" +
        "- It will be sliced into 25 pieces (5x5)\n" +
        "- Pieces appear ON TOP of center videos\n" +
        "- Reveals randomly after video mosaic\n" +
        "- Still requires 77 videos";
    
    // Error messages
    this.noFolderError = "Please select a folder in the Project panel.";
    this.wrongCountError = "The selected folder must contain exactly " + EXPECTED_VIDEO_COUNT + 
        " video items.\n\nCurrent count: ";
    this.noVideosError = "The selected folder contains no footage items.";
    
    // Default values
    this.orientation = "landscape"; // "landscape" or "portrait"
    this.enableStaggeredReveal = false;
    this.baseDuration = 60; // seconds
    this.fadeOutDuration = 30; // frames
    this.effectDuration = 10; // seconds - the window for staggered removal effect
    
    // Load orientation preference
    if (app.settings.haveSetting("VideoMosaicWall", "Orientation")) {
        this.orientation = app.settings.getSetting("VideoMosaicWall", "Orientation");
    }
    
    // Build the user interface
    this.buildUI = function(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptName, undefined, {resizeable: false});
        
        if (win == null) return null;
        
        // Main group
        var mainGroup = win.add("group{orientation:'column',alignment:['fill','fill'],alignChildren:['center','top']}");
        
        // Orientation panel
        var orientationPanel = mainGroup.add("panel", undefined, "Orientation");
        orientationPanel.alignment = ["fill", "top"];
        orientationPanel.alignChildren = ["left", "top"];
        
        var orientGroup = orientationPanel.add("group{orientation:'row'}");
        var landscapeRadio = orientGroup.add("radiobutton", undefined, "Landscape (16:9) - 3840x2160");
        var portraitRadio = orientGroup.add("radiobutton", undefined, "Portrait (9:16) - 2160x3840");
        
        if (self.orientation === "landscape") {
            landscapeRadio.value = true;
        } else {
            portraitRadio.value = true;
        }
        
        // Info panel (dynamic based on orientation)
        var infoPanel = mainGroup.add("panel", undefined, "Info");
        infoPanel.alignment = ["fill", "top"];
        infoPanel.alignChildren = ["left", "top"];
        
        // Function to update info text based on orientation
        function getInfoText(orientation) {
            if (orientation === "landscape") {
                return "Grid: 11x7 (77 cells)\n" +
                    "Videos: 77 (full grid, perfect center)\n" +
                    "Output: 3840x2160 @ 30fps\n" +
                    "Cell size: 349x309\n" +
                    "Duration: Set below\n\n" +
                    "Optional: Add 1 image for 5x5 center reveal\n" +
                    "(Image appears ON TOP of center videos)";
            } else {
                return "Grid: 7x11 (77 cells)\n" +
                    "Videos: 77 (full grid, perfect center)\n" +
                    "Output: 2160x3840 @ 30fps\n" +
                    "Cell size: 309x349\n" +
                    "Duration: Set below\n\n" +
                    "Optional: Add 1 image for 5x5 center reveal\n" +
                    "(Image appears ON TOP of center videos)";
            }
        }
        
        var infoText = infoPanel.add("statictext", undefined, getInfoText(self.orientation), {multiline: true});
        
        // Duration Settings panel
        var durationPanel = mainGroup.add("panel", undefined, "Duration Settings");
        durationPanel.alignment = ["fill", "top"];
        durationPanel.alignChildren = ["left", "top"];
        
        var baseDurationGroup = durationPanel.add("group{orientation:'row'}");
        baseDurationGroup.add("statictext", undefined, "Loop Duration (seconds):");
        var baseDurationInput = baseDurationGroup.add("edittext", undefined, self.baseDuration);
        baseDurationInput.characters = 8;
        
        var durationInfoText = durationPanel.add("statictext", undefined, 
            "How long videos loop before ending\n(or before staggered reveal effect begins)", 
            {multiline: true});
        durationInfoText.graphics.font = ScriptUI.newFont(durationInfoText.graphics.font.name, "ITALIC", 10);
        
        // Staggered Reveal Settings panel
        var revealPanel = mainGroup.add("panel", undefined, "Staggered Reveal (Optional)");
        revealPanel.alignment = ["fill", "top"];
        revealPanel.alignChildren = ["left", "top"];
        
        var enableRevealGroup = revealPanel.add("group{orientation:'row'}");
        var enableRevealCheckbox = enableRevealGroup.add("checkbox", undefined, "Enable Staggered Reveal");
        enableRevealCheckbox.value = self.enableStaggeredReveal;
        
        var fadeOutGroup = revealPanel.add("group{orientation:'row'}");
        fadeOutGroup.add("statictext", undefined, "Fade Out Duration (frames):");
        var fadeOutInput = fadeOutGroup.add("edittext", undefined, self.fadeOutDuration);
        fadeOutInput.characters = 8;
        fadeOutInput.enabled = self.enableStaggeredReveal;
        
        var effectGroup = revealPanel.add("group{orientation:'row'}");
        effectGroup.add("statictext", undefined, "Effect Duration (seconds):");
        var effectInput = effectGroup.add("edittext", undefined, self.effectDuration);
        effectInput.characters = 8;
        effectInput.enabled = self.enableStaggeredReveal;
        
        var revealInfoText = revealPanel.add("statictext", undefined, 
            "Videos snap out randomly during effect\nwindow. Center video is always last.", 
            {multiline: true});
        revealInfoText.graphics.font = ScriptUI.newFont(revealInfoText.graphics.font.name, "ITALIC", 10);
        
        // Progress group
        var progressGroup = mainGroup.add("group{orientation:'column',alignment:['fill','center']}");
        var progressBar = progressGroup.add("progressbar", undefined, 0, 100);
        progressBar.preferredSize = [300, 10];
        var progressText = progressGroup.add("statictext", undefined, "Ready");
        progressText.preferredSize = [300, 20];
        progressText.alignment = ["center", "top"];
        
        // Buttons
        var buttonGroup = mainGroup.add("group{orientation:'row',alignment:['center','center']}");
        var aboutBtn = buttonGroup.add("button", undefined, "About");
        var createBtn = buttonGroup.add("button", undefined, "Create Mosaic Wall");
        createBtn.preferredSize = [200, 30];
        
        // Event handlers
        landscapeRadio.onClick = function() {
            if (this.value) {
                self.orientation = "landscape";
                infoText.text = getInfoText("landscape");
            }
        };
        
        portraitRadio.onClick = function() {
            if (this.value) {
                self.orientation = "portrait";
                infoText.text = getInfoText("portrait");
            }
        };
        
        enableRevealCheckbox.onClick = function() {
            self.enableStaggeredReveal = this.value;
            fadeOutInput.enabled = this.value;
            effectInput.enabled = this.value;
        };
        
        baseDurationInput.onChange = function() {
            var val = parseFloat(this.text);
            if (!isNaN(val) && val > 0) {
                self.baseDuration = val;
            } else {
                this.text = self.baseDuration;
            }
        };
        
        fadeOutInput.onChange = function() {
            var val = parseInt(this.text);
            if (!isNaN(val) && val > 0) {
                self.fadeOutDuration = val;
            } else {
                this.text = self.fadeOutDuration;
            }
        };
        
        effectInput.onChange = function() {
            var val = parseFloat(this.text);
            if (!isNaN(val) && val > 0) {
                self.effectDuration = val;
            } else {
                this.text = self.effectDuration;
            }
        };
        
        aboutBtn.onClick = function() {
            alert(self.aboutText, self.scriptName);
        };
        
        createBtn.onClick = function() {
            // Read all values from UI before creating
            self.enableStaggeredReveal = enableRevealCheckbox.value;
            self.baseDuration = parseFloat(baseDurationInput.text) || 60;
            self.fadeOutDuration = parseInt(fadeOutInput.text) || 30;
            self.effectDuration = parseFloat(effectInput.text) || 10;
            
            self.createMosaic(progressBar, progressText);
        };
        
        // Show window
        if (win instanceof Window) {
            win.center();
            win.show();
        } else {
            win.layout.layout(true);
        }
        
        return win;
    };
    
    // Check if a folder is selected
    this.isFolderSelected = function() {
        if (!app.project.selection || app.project.selection.length === 0) {
            return false;
        }
        return (app.project.selection[0] instanceof FolderItem);
    };
    
    // Get all footage items from folder (videos only, not images)
    this.getFootageItems = function(folder) {
        var items = [];
        for (var i = 1; i <= folder.numItems; i++) {
            var item = folder.item(i);
            if (item instanceof FootageItem && !(item instanceof FolderItem)) {
                // Check if it's a video (not an image)
                var name = item.name.toLowerCase();
                var isImage = name.match(/\.(jpg|jpeg|png|gif|bmp|tif|tiff)$/i);
                if (!isImage) {
                    items.push(item);
                }
            }
        }
        return items;
    };
    
    // Get image file from folder (first image found)
    this.getImageFile = function(folder) {
        for (var i = 1; i <= folder.numItems; i++) {
            var item = folder.item(i);
            if (item instanceof FootageItem && !(item instanceof FolderItem)) {
                var name = item.name.toLowerCase();
                if (name.match(/\.(jpg|jpeg|png)$/i)) {
                    return item;
                }
            }
        }
        return null;
    };
    
    
    // Main creation function
    this.createMosaic = function(progressBar, progressText) {
        try {
            // Validate selection
            if (!this.isFolderSelected()) {
                throw new Error(this.noFolderError);
            }
            
            var proj = app.project;
            var sourceFolder = proj.selection[0];
            
            // Check for optional center image
            var imageFile = this.getImageFile(sourceFolder);
            var hasImage = (imageFile !== null);
            
            // Get video files only
            var footageItems = this.getFootageItems(sourceFolder);
            
            // Validate footage count
            if (footageItems.length === 0) {
                throw new Error(this.noVideosError);
            }
            
            // Always expect 80 videos
            if (footageItems.length !== EXPECTED_VIDEO_COUNT) {
                throw new Error(this.wrongCountError + footageItems.length + 
                    (hasImage ? "\n\n(Image detected: " + imageFile.name + " - will be placed on top of center)" : ""));
            }
            
            app.beginUndoGroup(this.scriptName);
            
            // Calculate dimensions based on orientation
            var COMP_WIDTH, COMP_HEIGHT, COLS, ROWS, CELL_WIDTH, CELL_HEIGHT;
            var CENTER_COL, CENTER_ROW, CENTER_START_COL, CENTER_END_COL, CENTER_START_ROW, CENTER_END_ROW;
            
            if (this.orientation === "landscape") {
                COMP_WIDTH = 3840;
                COMP_HEIGHT = 2160;
                COLS = 11;
                ROWS = 7;
            } else { // portrait
                COMP_WIDTH = 2160;
                COMP_HEIGHT = 3840;
                COLS = 7;
                ROWS = 11;
            }
            
            CELL_WIDTH = COMP_WIDTH / COLS;
            CELL_HEIGHT = COMP_HEIGHT / ROWS;
            
            // Calculate center positions dynamically
            CENTER_COL = Math.floor(COLS / 2);
            CENTER_ROW = Math.floor(ROWS / 2);
            
            // Calculate 5x5 image grid bounds (centered)
            CENTER_START_COL = CENTER_COL - 2;
            CENTER_END_COL = CENTER_COL + 3;
            CENTER_START_ROW = CENTER_ROW - 2;
            CENTER_END_ROW = CENTER_ROW + 3;
            
            progressText.text = "Creating folders...";
            
            // Create folder structure
            var masterFolder = proj.items.addFolder("Video Mosaic - " + sourceFolder.name);
            var precompsFolder = proj.items.addFolder("Cell Precomps");
            precompsFolder.parentFolder = masterFolder;
            
            // Get longest duration from all footage items
            var maxDuration = 0;
            for (var i = 0; i < footageItems.length; i++) {
                if (footageItems[i].duration > maxDuration) {
                    maxDuration = footageItems[i].duration;
                }
            }
            
            // Set composition duration
            // Image starts 3s before last video and takes 5s
            var compDuration;
            if (this.enableStaggeredReveal) {
                // Duration = base + effect, unless image extends beyond that
                var lastVideoTime = this.baseDuration + this.effectDuration;
                compDuration = lastVideoTime;
                if (hasImage) {
                    var imageEndTime = (lastVideoTime - 3) + IMAGE_REVEAL_DURATION; // lastVideo - 3 + 5 = lastVideo + 2
                    compDuration = Math.max(compDuration, imageEndTime);
                }
                progressText.text = "Duration: " + this.baseDuration + "s + " + this.effectDuration + "s effect = " + compDuration + "s";
            } else {
                // Just use loop duration, extend for image if needed
                compDuration = this.baseDuration;
                if (hasImage) {
                    var imageEndTime = (this.baseDuration - 3) + IMAGE_REVEAL_DURATION;
                    compDuration = Math.max(compDuration, imageEndTime);
                }
                progressText.text = "Duration: " + compDuration + "s";
            }
            
            progressText.text = "Creating main composition...";
            
            // Create main composition
            var mainComp = proj.items.addComp(
                "Mosaic Wall - " + sourceFolder.name,
                COMP_WIDTH,
                COMP_HEIGHT,
                1.0,
                compDuration,
                FRAME_RATE
            );
            // Don't set background color - leave transparent for reveal effect
            // mainComp.bgColor = [0, 0, 0];
            mainComp.parentFolder = masterFolder;
            
            progressBar.value = 0;
            progressBar.maxvalue = footageItems.length;
            
            // Create grid
            var videoIndex = 0;
            
            for (var row = 0; row < ROWS; row++) {
                for (var col = 0; col < COLS; col++) {
                    // Skip empty cells (no more videos)
                    if (videoIndex >= footageItems.length) {
                        break;
                    }
                    
                    var footageItem = footageItems[videoIndex];
                    
                    progressText.text = "Processing video " + (videoIndex + 1) + "/" + footageItems.length + 
                        " (Row " + (row + 1) + ", Col " + (col + 1) + ")";
                    
                    // Create cell precomp with full composition duration
                    var cellComp = proj.items.addComp(
                        "Cell_R" + (row + 1) + "C" + (col + 1) + "_" + footageItem.name,
                        Math.round(CELL_WIDTH),
                        Math.round(CELL_HEIGHT),
                        1.0,
                        compDuration,
                        FRAME_RATE
                    );
                    // Keep background transparent (no bgColor set) for reveal effect
                    cellComp.parentFolder = precompsFolder;
                    
                    // Add footage to cell precomp and scale to fill
                    var footageLayer = cellComp.layers.add(footageItem);
                    utils.scaleToFill(footageLayer, CELL_WIDTH, CELL_HEIGHT);
                    
                    // Enable time remapping to loop the video
                    var videoDuration = footageItem.duration;
                    footageLayer.timeRemapEnabled = true;
                    var timeRemap = footageLayer.property("ADBE Time Remapping");
                    
                    // Add loop expression
                    timeRemap.expression = "loopOut('cycle');";
                    
                    // AFTER time remapping is enabled, extend layer to full comp duration
                    footageLayer.startTime = 0;
                    footageLayer.outPoint = compDuration;
                    
                    // Add cell precomp to main comp
                    var cellLayer = mainComp.layers.add(cellComp);
                    
                    // Position the cell in the grid
                    var xPos = (col + 0.5) * CELL_WIDTH;
                    var yPos = (row + 0.5) * CELL_HEIGHT;
                    cellLayer.position.setValue([xPos, yPos]);
                    
                    // Apply staggered reveal if enabled
                    if (self.enableStaggeredReveal) {
                        var fadeOutDurationSec = self.fadeOutDuration / FRAME_RATE;
                        
                        var endTime = utils.calculateStaggeredEndTime(
                            row, 
                            col, 
                            ROWS, 
                            COLS, 
                            self.baseDuration, 
                            self.effectDuration,
                            fadeOutDurationSec
                        );
                        
                        // Set out point for the layer (video stops here)
                        cellLayer.outPoint = endTime;
                        
                        // Snap out instantly (no fade)
                        var opacityProp = cellLayer.property("ADBE Transform Group").property("ADBE Opacity");
                        opacityProp.setValueAtTime(endTime - 0.01, 100); // Visible just before
                        opacityProp.setValueAtTime(endTime, 0);           // Snap to transparent
                    }
                    
                    videoIndex++;
                    progressBar.value = videoIndex;
                }
            }
            
            progressBar.value = progressBar.maxvalue;
            progressText.text = "Complete! Created mosaic with " + videoIndex + " videos.";
            
            
            // Process center image if present
            if (hasImage) {
                progressText.text = "Creating center image reveal...";
                    
                    // Create folder for image pieces
                    var imagePiecesFolder = proj.items.addFolder("Image Pieces");
                    imagePiecesFolder.parentFolder = masterFolder;
                    
                    // Calculate image reveal start time (3 seconds before last video disappears)
                    // Last video (center) disappears at baseDuration + effectDuration
                    var lastVideoTime = this.enableStaggeredReveal ? 
                        (this.baseDuration + this.effectDuration) : this.baseDuration;
                    var imageStartTime = lastVideoTime - 3;
                    
                    // Create 25 image piece precomps (5x5 grid)
                    for (var pieceRow = 0; pieceRow < CENTER_IMAGE_SIZE; pieceRow++) {
                        for (var pieceCol = 0; pieceCol < CENTER_IMAGE_SIZE; pieceCol++) {
                
                        // Create precomp for this piece
                        var pieceComp = proj.items.addComp(
                            "ImagePiece_R" + (pieceRow + 1) + "C" + (pieceCol + 1),
                            Math.round(CELL_WIDTH),
                            Math.round(CELL_HEIGHT),
                            1.0,
                            compDuration,
                            FRAME_RATE
                        );
                        pieceComp.parentFolder = imagePiecesFolder;
                        
                        // Add image to piece precomp
                        var imageLayer = pieceComp.layers.add(imageFile);
                        
                        // Scale image to fill the entire 5x5 area
                        var fullImageWidth = CELL_WIDTH * CENTER_IMAGE_SIZE;  // 349 * 5 = 1745
                        var fullImageHeight = CELL_HEIGHT * CENTER_IMAGE_SIZE; // 309 * 5 = 1545
                        
                        // Verify image has valid dimensions
                        if (imageLayer.width == 0 || imageLayer.height == 0) {
                            throw new Error("Image has invalid dimensions: " + imageLayer.width + "x" + imageLayer.height);
                        }
                        
                        utils.scaleToFill(imageLayer, fullImageWidth, fullImageHeight);
                        
                        // Position image to show the correct section for this piece
                        // Image is scaled to fullImageWidth x fullImageHeight
                        // Piece comp is CELL_WIDTH x CELL_HEIGHT (a small window)
                        // We need to position the big image so the right section shows through
                        
                        // For 5x5: center is at (2, 2)
                        var centerIndex = 2;
                        
                        // How far this piece is from the center
                        var colOffset = pieceCol - centerIndex; // -2 to +2
                        var rowOffset = pieceRow - centerIndex; // -2 to +2
                        
                        // Position the image
                        // Center piece (2,2): image center at comp center
                        // Top-left (0,0): image needs to shift RIGHT and DOWN by 2 cells
                        // Bottom-right (4,4): image needs to shift LEFT and UP by 2 cells
                        var finalX = (pieceComp.width / 2) - (colOffset * CELL_WIDTH);
                        var finalY = (pieceComp.height / 2) - (rowOffset * CELL_HEIGHT);
                        
                        imageLayer.position.setValue([finalX, finalY]);
                        
                        // Add piece to main comp
                        var pieceLayer = mainComp.layers.add(pieceComp);
                        
                        // Position in grid (center 5x5)
                        var gridRow = CENTER_START_ROW + pieceRow;
                        var gridCol = CENTER_START_COL + pieceCol;
                        var xPos = (gridCol + 0.5) * CELL_WIDTH;
                        var yPos = (gridRow + 0.5) * CELL_HEIGHT;
                        pieceLayer.position.setValue([xPos, yPos]);
                        
                        // Calculate staggered reveal time (random for each piece)
                        var pieceRevealTime = utils.calculateImagePieceRevealTime(
                            pieceRow,
                            pieceCol,
                            CENTER_IMAGE_SIZE,
                            imageStartTime,
                            IMAGE_REVEAL_DURATION
                        );
                        
                        // Set layer start time to beginning of reveal window
                        pieceLayer.startTime = imageStartTime;
                        
                        // Snap in instantly at the calculated random time
                        var opacityProp = pieceLayer.property("ADBE Transform Group").property("ADBE Opacity");
                        
                        // Add keyframes with HOLD interpolation
                        opacityProp.setValueAtTime(imageStartTime, 0);       // Hidden at start
                        opacityProp.setValueAtTime(pieceRevealTime, 100);      // SNAP to visible
                        
                        // Set the first keyframe to HOLD (no interpolation)
                        if (opacityProp.numKeys >= 2) {
                            opacityProp.setInterpolationTypeAtKey(1, KeyframeInterpolationType.HOLD);
                        }
                    }
                }
                
                progressText.text = "Center image reveal created!";
            }
            
            app.endUndoGroup();
            
            // Show success message
            var orientInfo = this.orientation === "landscape" ? "Landscape (3840x2160, 11x7)" : "Portrait (2160x3840, 7x11)";
            var successMsg = "Mosaic wall created successfully!\n\n" +
                  "Orientation: " + orientInfo + "\n" +
                  "Videos placed: " + videoIndex + "\n" +
                  "Composition: " + mainComp.name + "\n" +
                  "Total composition duration: " + compDuration.toFixed(2) + " seconds\n";
            
            if (this.enableStaggeredReveal) {
                successMsg += "\nStaggered Reveal Enabled:\n" +
                    "- Videos loop for: " + this.baseDuration + " seconds\n" +
                    "- Effect window: " + this.effectDuration + " seconds\n" +
                    "- Videos snap out RANDOMLY (center last)\n" +
                    "- Transparent cells reveal layers behind";
            } else {
                successMsg += "\nVideos loop continuously for " + this.baseDuration + " seconds";
            }
            
            if (hasImage) {
                var lastVideoTime = this.enableStaggeredReveal ? 
                    (this.baseDuration + this.effectDuration) : this.baseDuration;
                var imageRevealStart = lastVideoTime - 3;
                var imageRevealEnd = imageRevealStart + IMAGE_REVEAL_DURATION;
                var totalPieces = CENTER_IMAGE_SIZE * CENTER_IMAGE_SIZE;
                successMsg += "\n\nCenter Image Reveal:\n" +
                    "- Image: " + imageFile.name + "\n" +
                    "- 5x5 grid in center (" + totalPieces + " pieces)\n" +
                    "- Starts: " + imageRevealStart + "s (3s before center video ends at " + lastVideoTime + "s)\n" +
                    "- Finishes: " + imageRevealEnd + "s (2s after last video)\n" +
                    "- Duration: " + IMAGE_REVEAL_DURATION + " seconds\n" +
                    "- 25 pieces snap in randomly, one at a time";
            }
            
            alert(successMsg, this.scriptName);
            
            // Save orientation preference
            app.settings.saveSetting("VideoMosaicWall", "Orientation", this.orientation);
            
        } catch (err) {
            app.endUndoGroup();
            alert("Error: " + err.toString(), this.scriptName);
            progressText.text = "Error occurred";
            progressBar.value = 0;
        }
    };
    
    // Run the script
    this.run = function(thisObj) {
        this.buildUI(thisObj);
    };
}

// Utility functions
function MosaicUtils() {
    // Scale layer to fill the target dimensions (cover fit)
    // Uses Math.max to ensure the layer fills the container completely
    this.scaleToFill = function(layer, targetWidth, targetHeight) {
        var layerWidth = layer.width;
        var layerHeight = layer.height;
        
        if (layerWidth === 0 || layerHeight === 0 || targetWidth === 0 || targetHeight === 0) {
            throw new Error("Cannot scale layer: Invalid dimensions. Layer: " + layerWidth + "x" + layerHeight + 
                ", Target: " + targetWidth + "x" + targetHeight);
        }
        
        var scaleX = targetWidth / layerWidth;
        var scaleY = targetHeight / layerHeight;
        
        // Use Math.max to fill (cover) - this ensures no empty space
        var scale = Math.max(scaleX, scaleY);
        
        layer.scale.setValue([scale * 100, scale * 100]);
    };
    
    // Calculate staggered end time - random for all except center is always last
    // Videos end randomly within the effect window, but center video ends at the very end
    this.calculateStaggeredEndTime = function(row, col, totalRows, totalCols, baseDuration, effectDuration, fadeOutDuration) {
        // Calculate center position (0-indexed)
        var centerRow = Math.floor(totalRows / 2);
        var centerCol = Math.floor(totalCols / 2);
        
        // Check if this IS the center cell
        var isCenter = (row === centerRow && col === centerCol);
        
        if (isCenter) {
            // Center cell ALWAYS ends at the very end
            return baseDuration + effectDuration;
        } else {
            // All other cells end randomly within the effect window
            // Ensure they end before the center cell
            var minEndTime = baseDuration + fadeOutDuration;
            var maxEndTime = baseDuration + effectDuration - 0.5; // Leave 0.5s gap before center
            var randomTime = minEndTime + (Math.random() * (maxEndTime - minEndTime));
            return randomTime;
        }
    };
    
    // Calculate image piece reveal time - fully random for each piece
    // Each piece appears at a unique random time within the duration window
    this.calculateImagePieceRevealTime = function(pieceRow, pieceCol, gridSize, startTime, duration) {
        // Completely random reveal time - each piece independent
        // This ensures no two pieces appear at exactly the same time
        var randomTime = Math.random() * duration;
        
        var revealTime = startTime + randomTime;
        
        return revealTime;
    };
}

// Create and run the script
new VideoMosaicWall().run(this);

