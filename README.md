# Image Editor Application

I built this image editor using React, TypeScript, and Fabric.js. The main goal was to create a clean and structured editor where image manipulation works correctly and predictably, not just visually.

I focused on proper canvas state management, clean architecture, and making sure features like crop and undo/redo behave reliably even after scaling or zooming.

[**🔴 Live Demo**](https://optimum-image-editor-app.vercel.app/)

## Tech Stack

For the frontend, I used:

- React 18
- TypeScript
- Vite
- Fabric.js (v5)
- Tailwind CSS
- Shadcn UI components
- Lucide icons

I directly integrated Fabric.js using custom hooks instead of using any third-party wrapper. This gave me full control over canvas lifecycle and object handling.

## Features I Implemented

### Image Handling
- Upload image from local system
- Automatically center the image on canvas
- Zoom in and zoom out
- Rotate image by 90 degrees

### Crop Tool
I implemented a proper cropping system where:
- User selects a crop area visually
- Crop is calculated based on original image pixels
- Canvas resizes to cropped dimensions
- Cropped image remains centered
- Crop works correctly even after scaling

This was one of the most important parts of the project because incorrect coordinate handling can easily break cropping.

### Drawing & Annotations
- Free drawing with adjustable stroke
- Rectangle and circle shapes
- Editable text
- Color and stroke width controls

### Undo / Redo
- Custom history stack
- Up to 50 steps
- Supports drawing, shapes, text, crop, and rotation

### Export
- Export final image
- Export full canvas state as JSON
- JSON can be used to restore the canvas later

## Project Structure

I separated logic clearly:

```
src/
├── components/
├── hooks/
├── pages/
├── types/
└── lib/
```

- **Canvas logic** is inside custom hooks.
- **UI** is separated into reusable components.
- **History logic** is handled independently.

This makes the project easier to maintain and extend.

## Implementation Approach

- I used a mode-based system (Select, Draw, Crop) to prevent tool conflicts.
- The Fabric canvas instance is stored using `useRef` to avoid unnecessary re-renders.
- For crop, instead of using `canvas.toDataURL`, I calculated coordinates relative to the original image and extracted the selected region properly. This ensures accuracy regardless of zoom or scale.
- Undo/redo is implemented by storing canvas JSON states.

Overall, I tried to build it in a way that reflects real-world frontend development — clean structure, predictable behavior, and clear separation of concerns.
