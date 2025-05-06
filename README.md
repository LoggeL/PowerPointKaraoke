# PowerPoint Karaoke Presentations

A collection of amusing Reveal.js presentations designed for PowerPoint Karaoke - where presenters have to give presentations about topics they've never seen before!

## Available Presentations

There are currently 17 presentations available (p1 through p17), each with its own unique and absurd topic. To view a presentation:

1. Navigate to the presentation folder (e.g., `p1/`, `p2/`, etc.)
2. Open the respective `index.html` file in a browser

Access any presentation by using this pattern:
```
p[number]/index.html
```
Where `[number]` is any number from 1 to 17.

## Features

- Built with [Reveal.js](https://revealjs.com/)
- Responsive design that works on all modern browsers
- Uses Font Awesome icons for visual elements
- Includes high-quality AI-generated images (stored as PNG files)
- Presentation controls for easy navigation

## How to Use

1. Clone this repository
2. Open any presentation's `index.html` file in a modern web browser
3. Present with confidence (or confusion - that's part of the fun!)

### Presentation Controls

- **Next slide**: Right arrow, Down arrow, Space
- **Previous slide**: Left arrow, Up arrow
- **Overview**: Press `ESC`
- **Fullscreen**: Press `F`
- **Speaker notes**: Press `S`
- **End presentation**: Press `ESC` twice

## Technical Details

- All presentations use Reveal.js for the slideshow functionality
- Icons are loaded from Font Awesome
- Resources are loaded via CDNs (Internet connection required)
- Presentations are structured with both HTML and Markdown files
- Images are generated using ComfyUI

## Structure

Each presentation follows this structure:
```
p[1-17]/
├── index.html          # The presentation HTML file
├── p[1-17].md         # Optional markdown content
└── ComfyUI_*.png      # AI-generated images
```

## Adding New Presentations

To add a new presentation:
1. Create a new directory following the naming pattern (`p18/`, etc.)
2. Include an `index.html` file using the existing structure
3. Optionally include a markdown file for content
4. Add necessary AI-generated images
5. Follow the existing presentation format

## Contributing

Feel free to contribute your own absurd presentations through pull requests!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
