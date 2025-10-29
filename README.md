# MosaicPro

After Effects script for creating video mosaic wall compositions with automatic grid calculation and optional reveal effects.

## Features

- Automatic grid layout calculation for any video count
- 4K output: Landscape (3840x2160) or Portrait (2160x3840)
- Looping video playback for custom durations
- Optional staggered reveal effect
- Optional center image/logo reveal
- Transparent backgrounds for compositing

## Installation

### Mac
```
/Applications/Adobe After Effects [version]/Scripts/ScriptUI Panels/
```

### Windows
```
C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\Scripts\ScriptUI Panels\
```

1. Copy `MosaicPro.jsx` to the Scripts folder
2. Restart After Effects
3. Access via Window > MosaicPro.jsx

## Usage

### Basic Mosaic

1. Import video files into a folder in Project panel
2. Select the folder
3. Run MosaicPro
4. Choose Landscape or Portrait
5. Set duration
6. Click "Create Mosaic"

### With Reveal Effect

1. Enable "Reveal Effect" checkbox
2. Adjust Speed and Window values
3. Videos will disappear randomly, revealing layers beneath

### With Center Image

1. Add one .jpg or .png image file to your folder with videos
2. Script will automatically detect and integrate it
3. Image will be split into pieces and revealed in center

## Requirements

- Adobe After Effects CC 2015 or later
- Video count must allow odd x odd grid:
  - Perfect: 9, 15, 21, 25, 27, 35, 45, 49, 63, 77, 81, 99, 105, 121, 143, 165...
  - Script will suggest adjustments for other counts

## Settings Reference

### Duration
Total playback time in seconds before reveal effect begins.

### Reveal Effect
- **Enable**: Activates staggered disappearing effect
- **Speed**: Transition speed in frames (default: 30)
- **Window**: Time period for effect in seconds (default: 10)

### Orientation
- **Landscape**: 3840x2160 (16:9) - Horizontal format
- **Portrait**: 2160x3840 (9:16) - Vertical format

## Export Guide

To preserve transparency when using reveal effects:

1. Composition > Add to Render Queue
2. Output Module > Format: QuickTime
3. Format Options: Apple ProRes 4444
4. **Channels: RGB + Alpha** (required for transparency)
5. Render

Import the rendered file into Premiere Pro to see transparent areas.

## Troubleshooting

**"Cannot create grid with X videos"**
Follow the suggested video count adjustments in the error message.

**"Grid too small for image reveal"**
Minimum 7x7 grid (49 videos) required for image feature.

**Black cells instead of transparent**
Export with ProRes 4444 + Alpha channel. MP4/H.264 does not support transparency.

## Credits

**Author**: Tommy Geoco  
**Website**: [designertom.io](https://designertom.io)  
**Tools**: [uxtools.co](https://uxtools.co)

## License

MIT License - Free for personal and commercial use.

## Version History

### v1.0.0 (2025)
- Initial release
- Dynamic grid calculation
- Landscape/Portrait support
- Staggered reveal effect
- Center image reveal

---

For support or feature requests, visit the GitHub repository.
