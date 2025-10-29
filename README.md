# MosaicPro v1.0.0

**Professional Video Mosaic Wall Creator for Adobe After Effects**

Create stunning video mosaic compositions automatically with intelligent grid calculations, optional reveal effects, and center image integration.

---

## 🎯 Features

- **Intelligent Grid Calculation** - Automatically finds the optimal layout for any video count
- **Dual Orientation Support** - 4K Landscape (3840×2160) or Portrait (2160×3840) @ 30fps
- **Perfect Center Alignment** - Always creates balanced odd×odd grids
- **Looping Videos** - Seamless video playback for any duration
- **Staggered Reveal Effect** - Videos disappear randomly to reveal layers beneath
- **Center Image/Logo Reveal** - Optional feature to reveal branding in the center
- **Export Ready** - Transparent backgrounds for easy compositing in Premiere Pro
- **No Limits** - Works with any video count (9-500+ videos)

---

## 📦 Installation

1. Download `MosaicPro.jsx`
2. Place in your After Effects Scripts folder:
   - **Windows**: `C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\Scripts\`
   - **Mac**: `/Applications/Adobe After Effects [version]/Scripts/`
3. Restart After Effects
4. Access via **File > Scripts > MosaicPro**

---

## 🚀 Quick Start

### Basic Mosaic

1. Import your video files into a folder in the Project panel
2. Select the folder
3. Run **File > Scripts > MosaicPro**
4. Choose **Landscape** or **Portrait**
5. Set your desired **Duration**
6. Click **Create Mosaic**

### With Reveal Effect

1. Follow basic steps above
2. Check **Enable Reveal Effect**
3. Adjust **Effect Window** (default: 10 seconds)
4. Videos will disappear randomly, revealing layers beneath

### With Center Image/Logo

1. Add one `.jpg` or `.png` image to your folder with videos
2. Follow basic steps above
3. The image will automatically:
   - Be detected
   - Sliced into pieces (3×3, 5×5, or 7×7 depending on grid size)
   - Reveal randomly in the center after videos

---

## 📹 Supported Video Counts

**Perfect counts** (creates odd×odd grids with square-ish cells):
- Small: 9, 15, 21, 25, 27, 35, 45, 49
- Medium: 63, 77, 81, 99, 105, 121, 143, 165
- Large: 225, 289, 361, 441, 529+

**For other counts**, the script will suggest adjustments (e.g., "Add 2 videos" or "Remove 1 video").

---

## 🎬 Export for Premiere Pro

To preserve transparency when using the reveal effect:

1. **Composition > Add to Render Queue**
2. Click **Output Module**
3. **Format**: QuickTime
4. **Format Options**: Apple ProRes 4444
5. **Channels**: **RGB + Alpha** ✓ (Critical!)
6. Render and import into Premiere Pro

---

## ⚙️ Settings Explained

### Duration
How long your mosaic plays before the reveal effect begins.

### Reveal Effect
- **Effect Window**: Time period for videos to disappear (10s recommended)
- **Transition Speed**: How quickly each video snaps out (30 frames default)

### Orientation
- **Landscape**: 3840×2160 (16:9) - Wide format
- **Portrait**: 2160×3840 (9:16) - Vertical/mobile format

---

## 💡 Tips & Tricks

1. **Best Results**: Use 77, 81, 99, or 105 videos for ideal grid dimensions
2. **Center Image**: Keep it square (1:1 ratio) for best results
3. **Performance**: Pre-render the composition before importing to Premiere Pro
4. **Looping**: Videos automatically loop to fill the duration
5. **Center Focus**: The center video always disappears last (perfect for highlighting)

---

## 🐛 Troubleshooting

**"Cannot create odd×odd grid"**
- Follow the suggested video count adjustments

**"Grid too small for image reveal"**
- Minimum 7×7 grid required (49 videos)
- Use more videos or skip the image feature

**Black cells instead of transparent**
- Export with ProRes 4444 + Alpha channel
- Don't use MP4/H.264 (no transparency support)

---

## 📝 Version History

### v1.0.0 (2025)
- Initial public release
- Dynamic grid calculation
- Landscape/Portrait support
- Staggered reveal effect
- Center image reveal feature

---

## 📄 License

Free for personal and commercial use.

---

**Created for motion designers by motion designers** 🎨

