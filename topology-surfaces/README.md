# Topology surfaces

Open `index.html` in a modern browser. No installation, build step, server or internet connection is needed. Keep the folder contents together when moving or sharing the project.

The home menu opens:

- **Polygonal presentations**: the four examples from the surface-presentation sheet, plus the standard square-to-torus, genus 2 and Klein bottle animations. Playback, scrubbing, rotation, edge tracking, and the latest deformation and transparency controls are preserved.
- **Four descriptions of the torus**: only the torus visuals from Exercise 3: linked square, lattice, circle-product and torus views, plus the circle-of-revolution animation. The earlier projective-space, cone and suspension visuals are not included.

All navigation stays within this folder. The polygonal animations use WebGL; the linked torus descriptions use Canvas 2D. All scripts and styles are local; the project makes no network requests.

## Contents

- `index.html` and `style.css`: the front-page menu.
- `polygonal-presentations/`: the four presentation examples and three standard-presentation pages, with their shared viewer and mathematical geometry.
- `torus/`: the torus descriptions and revolution animation, with only their required controls and geometric helpers.

## Shape reference

The traditional Klein-bottle profile follows the mathematical construction published with [Tttrung’s Klein bottle.svg](https://commons.wikimedia.org/wiki/File:Klein_bottle.svg). The SVG is not bundled; the project generates the surface locally. The genus-2 animation forms two cylinders with disc openings, bends them into punctured tori, and glues their circular boundaries into a genuine connecting neck.
