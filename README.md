# Celestial Bodies & Atmospheric Scattering Rendering
Final group project for Advanced Computer Graphics 2022 Fall course.
## Overview
Modelling an alien planet and its moon with realistic atmosphere, using three.js + vite + custom shaders.
## Running
Run the following on a new terminal,  

    $ npm install
    $ npm run dev

## Implementations
In addition to Three.js functionalities for 3D texture mapping of the planet and the moon, our project involves two separate shader pairs for atmospheric scattering. One, _atmosphere_vertex.glsl & atmosphere_fragment.glsl_, deals with a rather simple atmospheric effect, applying _blurry_ effect on the surface of the planet. The other, _scatter_vertex.glsl & scatter_fragment.glsl_, deals with more advanced stuff, considering Rayleigh & Mie scattering and implementing the halo effect on the outer ring of the planet. The combination of the two shaders simulate realistic, Earth-resembling atmospheric scattering effects on our planet.
