/*
 * MosaicPro v1.0.0
 * Professional Video Mosaic Wall Creator for After Effects
 * 
 * Automatically creates stunning video mosaic compositions with:
 * - Intelligent grid calculation for any video count
 * - 4K landscape or portrait orientation support
 * - Optional staggered reveal effects
 * - Optional center image/logo reveal
 * - Transparent backgrounds for easy compositing
 * 
 * Perfect for social media content, video walls, and motion graphics
 * 
 * © 2025 - Created for motion designers
 */

// Frame rate constant
var FRAME_RATE = 30;
var IMAGE_REVEAL_DURATION = 3; // seconds

// Main class
function VideoMosaicWall() {
    var self = this;
    var utils = new MosaicUtils();
    
    // Script info
    this.scriptName = "MosaicPro";
    this.scriptVersion = "1.0.0";
    
    // UI strings
    this.aboutText = this.scriptName + " v" + this.scriptVersion + "\n\n" +
        "Professional video mosaic wall creator for After Effects.\n\n" +
        "KEY FEATURES:\n" +
        "• Intelligent Grid - Automatically calculates optimal layout\n" +
        "• Any Video Count - Works with your footage library\n" +
        "• Dual Orientation - 4K Landscape or Portrait output\n" +
        "• Perfect Center - Always creates balanced grids\n" +
        "• Looping Videos - Seamless playback for any duration\n" +
        "• Staggered Reveal - Dynamic disappearing effect\n" +
        "• Center Image - Optional logo/image reveal feature\n" +
        "• Export Ready - Transparent backgrounds for compositing\n\n" +
        "HOW TO USE:\n" +
        "1. Import videos into a folder in your Project panel\n" +
        "2. Optionally add one image (.jpg/.png) for center reveal\n" +
        "3. Select the folder in your Project panel\n" +
        "4. Choose orientation and duration settings\n" +
        "5. Click 'Create Mosaic Wall'\n\n" +
        "TIP: Works best with odd×odd counts (9, 15, 21, 25, 35, 45, 49, 63, 77, 81, 99, 105, 121...)\n" +
        "Script will guide you if adjustments are needed.\n\n" +
        "Created for motion designers by motion designers.";
    
    // Error messages
    this.noFolderError = "Please select a folder in the Project panel.";
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
            var dims = orientation === "landscape" ? "3840×2160" : "2160×3840";
            var aspectName = orientation === "landscape" ? "Landscape (16:9)" : "Portrait (9:16)";
            return aspectName + "\n" +
                dims + " @ 30fps\n\n" +
                "✓ Intelligent grid auto-calculation\n" +
                "✓ Perfect center alignment\n" +
                "✓ Looping videos\n" +
                "✓ Optional staggered reveal effect\n" +
                "✓ Optional center image reveal\n" +
                "✓ Transparent backgrounds\n\n" +
                "Select a folder with videos to begin.";
        }
        
        var infoText = infoPanel.add("statictext", undefined, getInfoText(self.orientation), {multiline: true});
        
        // Duration Settings panel
        var durationPanel = mainGroup.add("panel", undefined, "Duration Settings");
        durationPanel.alignment = ["fill", "top"];
        durationPanel.alignChildren = ["left", "top"];
        
        var baseDurationGroup = durationPanel.add("group{orientation:'row'}");
        baseDurationGroup.add("statictext", undefined, "Duration (seconds):");
        var baseDurationInput = baseDurationGroup.add("edittext", undefined, self.baseDuration);
        baseDurationInput.characters = 8;
        
        var durationInfoText = durationPanel.add("statictext", undefined, 
            "How long your mosaic plays", 
            {multiline: true});
        durationInfoText.graphics.font = ScriptUI.newFont(durationInfoText.graphics.font.name, "ITALIC", 10);
        
        // Reveal Effect Settings panel
        var revealPanel = mainGroup.add("panel", undefined, "Reveal Effect (Optional)");
        revealPanel.alignment = ["fill", "top"];
        revealPanel.alignChildren = ["left", "top"];
        
        var enableRevealGroup = revealPanel.add("group{orientation:'row'}");
        var enableRevealCheckbox = enableRevealGroup.add("checkbox", undefined, "Enable Reveal Effect");
        enableRevealCheckbox.value = self.enableStaggeredReveal;
        
        var fadeOutGroup = revealPanel.add("group{orientation:'row'}");
        fadeOutGroup.add("statictext", undefined, "Transition Speed (frames):");
        var fadeOutInput = fadeOutGroup.add("edittext", undefined, self.fadeOutDuration);
        fadeOutInput.characters = 8;
        fadeOutInput.enabled = self.enableStaggeredReveal;
        
        var effectGroup = revealPanel.add("group{orientation:'row'}");
        effectGroup.add("statictext", undefined, "Effect Window (seconds):");
        var effectInput = effectGroup.add("edittext", undefined, self.effectDuration);
        effectInput.characters = 8;
        effectInput.enabled = self.enableStaggeredReveal;
        
        var revealInfoText = revealPanel.add("statictext", undefined, 
            "Videos disappear randomly to reveal\nlayers beneath. Center cell exits last.", 
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
        var createBtn = buttonGroup.add("button", undefined, "Create Mosaic");
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
            
            var videoCount = footageItems.length;
            
            // Calculate composition dimensions based on orientation
            var baseCompWidth = this.orientation === "landscape" ? 3840 : 2160;
            var baseCompHeight = this.orientation === "landscape" ? 2160 : 3840;
            
            // Calculate optimal grid
            var optimalGrid = utils.calculateOptimalGrid(videoCount, baseCompWidth, baseCompHeight);
            
            if (optimalGrid === null) {
                // No perfect odd×odd grid exists
                var nearestGrids = utils.findNearestOddGrids(videoCount);
                var suggestions = "\n\n💡 SUGGESTIONS:";
                
                if (nearestGrids.below) {
                    var removeCount = videoCount - nearestGrids.below.count;
                    var bestBelow = utils.calculateOptimalGrid(nearestGrids.below.count, baseCompWidth, baseCompHeight);
                    suggestions += "\n\n✓ Remove " + removeCount + " video" + (removeCount > 1 ? "s" : "") + 
                        " → " + nearestGrids.below.count + " total";
                    if (bestBelow) {
                        suggestions += "\n   Grid: " + bestBelow.cols + "×" + bestBelow.rows;
                    }
                }
                if (nearestGrids.above) {
                    var addCount = nearestGrids.above.count - videoCount;
                    var bestAbove = utils.calculateOptimalGrid(nearestGrids.above.count, baseCompWidth, baseCompHeight);
                    suggestions += "\n\n✓ Add " + addCount + " video" + (addCount > 1 ? "s" : "") + 
                        " → " + nearestGrids.above.count + " total";
                    if (bestAbove) {
                        suggestions += "\n   Grid: " + bestAbove.cols + "×" + bestAbove.rows;
                    }
                }
                
                throw new Error("⚠️ Cannot Create Perfect Grid\n\n" +
                    "Your folder has " + videoCount + " videos.\n\n" +
                    "MosaicPro requires an odd×odd grid for perfect center alignment." + suggestions);
            }
            
            // Show calculated grid info and confirm
            var cellWidth = baseCompWidth / optimalGrid.cols;
            var cellHeight = baseCompHeight / optimalGrid.rows;
            var cellAspect = (cellWidth / cellHeight).toFixed(2);
            var imageGridSize = utils.calculateImageGridSize(optimalGrid.rows, optimalGrid.cols);
            
            var confirmMsg = "MosaicPro - Layout Preview\n\n" +
                "📹 Videos: " + videoCount + "\n" +
                "📐 Grid: " + optimalGrid.cols + " × " + optimalGrid.rows + " (" + (optimalGrid.rows * optimalGrid.cols) + " cells)\n" +
                "📏 Cell size: " + Math.round(cellWidth) + "×" + Math.round(cellHeight) + "px\n" +
                "⚖️  Cell ratio: " + cellAspect + ":1\n";
            
            if (hasImage) {
                if (imageGridSize > 0) {
                    confirmMsg += "\n🖼️  Center Image: " + imageFile.name + "\n" +
                        "   " + imageGridSize + "×" + imageGridSize + " grid (" + (imageGridSize * imageGridSize) + " pieces)\n";
                } else {
                    confirmMsg += "\n⚠️  Grid too small for image reveal (min 7×7 required)\n" +
                        "   Image will be skipped\n";
                }
            }
            
            confirmMsg += "\n✨ Ready to create your mosaic?";
            
            if (!confirm(confirmMsg)) {
                throw new Error("User cancelled");
            }
            
            app.beginUndoGroup(this.scriptName);
            
            // Use calculated optimal grid dimensions
            var COMP_WIDTH = baseCompWidth;
            var COMP_HEIGHT = baseCompHeight;
            var COLS = optimalGrid.cols;
            var ROWS = optimalGrid.rows;
            var CELL_WIDTH = COMP_WIDTH / COLS;
            var CELL_HEIGHT = COMP_HEIGHT / ROWS;
            
            // Calculate center positions dynamically
            var CENTER_COL = Math.floor(COLS / 2);
            var CENTER_ROW = Math.floor(ROWS / 2);
            
            // Calculate dynamic image grid size based on total grid
            var CENTER_IMAGE_SIZE = utils.calculateImageGridSize(ROWS, COLS);
            
            // Calculate center image grid bounds (only if image grid size > 0)
            var CENTER_START_COL, CENTER_END_COL, CENTER_START_ROW, CENTER_END_ROW;
            if (CENTER_IMAGE_SIZE > 0) {
                var halfSize = Math.floor(CENTER_IMAGE_SIZE / 2);
                CENTER_START_COL = CENTER_COL - halfSize;
                CENTER_END_COL = CENTER_COL + halfSize + 1;
                CENTER_START_ROW = CENTER_ROW - halfSize;
                CENTER_END_ROW = CENTER_ROW + halfSize + 1;
            }
            
            // Disable image feature if grid is too small
            if (hasImage && CENTER_IMAGE_SIZE === 0) {
                hasImage = false; // Grid too small for image
            }
            
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
            var orientInfo = this.orientation === "landscape" ? "Landscape" : "Portrait";
            var successMsg = "✨ Mosaic Created Successfully!\n\n" +
                  "📐 " + orientInfo + ": " + COMP_WIDTH + "×" + COMP_HEIGHT + "\n" +
                  "🎬 Grid: " + COLS + "×" + ROWS + " (" + videoIndex + " videos)\n" +
                  "⏱️  Duration: " + compDuration.toFixed(1) + " seconds\n" +
                  "📁 " + mainComp.name + "\n";
            
            if (this.enableStaggeredReveal) {
                successMsg += "\nReveal Effect:\n" +
                    "✓ Videos loop: " + this.baseDuration + " seconds\n" +
                    "✓ Reveal window: " + this.effectDuration + " seconds\n" +
                    "✓ Cells disappear randomly (center exits last)";
            } else {
                successMsg += "\n✓ Videos loop continuously: " + this.baseDuration + " seconds";
            }
            
            if (hasImage && CENTER_IMAGE_SIZE > 0) {
                var lastVideoTime = this.enableStaggeredReveal ? 
                    (this.baseDuration + this.effectDuration) : this.baseDuration;
                var imageRevealStart = lastVideoTime - 3;
                var imageRevealEnd = imageRevealStart + IMAGE_REVEAL_DURATION;
                var totalPieces = CENTER_IMAGE_SIZE * CENTER_IMAGE_SIZE;
                successMsg += "\n\nCenter Image:\n" +
                    "✓ " + imageFile.name + "\n" +
                    "✓ Split into " + totalPieces + " pieces (" + CENTER_IMAGE_SIZE + "×" + CENTER_IMAGE_SIZE + " grid)\n" +
                    "✓ Reveals from " + imageRevealStart + "s to " + imageRevealEnd + "s\n" +
                    "✓ Pieces appear randomly";
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
    // Find all odd×odd divisor pairs for a given number
    this.findOddDivisorPairs = function(number) {
        var pairs = [];
        var sqrtNum = Math.sqrt(number);
        
        for (var rows = 1; rows <= number; rows += 2) { // odd only
            if (number % rows === 0) { // perfect divisor
                var cols = number / rows;
                if (cols % 2 === 1) { // cols must also be odd
                    pairs.push({rows: rows, cols: cols});
                }
            }
        }
        
        return pairs;
    };
    
    // Score a grid based on cell squareness
    this.scoreGrid = function(grid, compWidth, compHeight) {
        var cellWidth = compWidth / grid.cols;
        var cellHeight = compHeight / grid.rows;
        var aspectRatio = cellWidth / cellHeight;
        
        // Perfect square = 1.0, further from 1.0 = worse score
        var squareness = 1.0 - Math.abs(1.0 - aspectRatio);
        
        // Prefer grids with more balanced dimensions (not too wide or tall)
        var smaller = Math.min(grid.rows, grid.cols);
        var larger = Math.max(grid.rows, grid.cols);
        var balance = smaller / larger;
        
        // Combined score: 70% squareness, 30% balance
        return squareness * 0.7 + balance * 0.3;
    };
    
    // Calculate optimal grid for video count
    this.calculateOptimalGrid = function(videoCount, compWidth, compHeight) {
        var oddGrids = this.findOddDivisorPairs(videoCount);
        
        if (oddGrids.length === 0) {
            // No perfect odd×odd grid exists
            return null;
        }
        
        // Score all valid grids and pick the best
        var bestGrid = null;
        var bestScore = -1;
        
        for (var i = 0; i < oddGrids.length; i++) {
            var score = this.scoreGrid(oddGrids[i], compWidth, compHeight);
            if (score > bestScore) {
                bestScore = score;
                bestGrid = oddGrids[i];
            }
        }
        
        return bestGrid;
    };
    
    // Find nearest odd perfect square numbers
    this.findNearestOddGrids = function(videoCount) {
        var result = {below: null, above: null};
        
        // Search for closest odd×odd grid below
        for (var count = videoCount - 1; count > 0; count--) {
            var oddGrids = this.findOddDivisorPairs(count);
            if (oddGrids.length > 0) {
                result.below = {count: count, grids: oddGrids};
                break;
            }
        }
        
        // Search for closest odd×odd grid above
        for (var count = videoCount + 1; count < videoCount + 200; count++) {
            var oddGrids = this.findOddDivisorPairs(count);
            if (oddGrids.length > 0) {
                result.above = {count: count, grids: oddGrids};
                break;
            }
        }
        
        return result;
    };
    
    // Calculate appropriate image grid size based on total grid dimensions
    this.calculateImageGridSize = function(totalRows, totalCols) {
        var totalCells = totalRows * totalCols;
        var minDim = Math.min(totalRows, totalCols);
        
        // Image grid must fit within the total grid with room around edges
        // And must be odd for center alignment
        if (minDim >= 11 && totalCells >= 121) return 7; // 7×7 for large grids
        if (minDim >= 9 && totalCells >= 81) return 5;   // 5×5 for medium grids
        if (minDim >= 7 && totalCells >= 49) return 3;   // 3×3 for small grids
        return 0; // No image support for tiny grids
    };
    
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

