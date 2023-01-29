// source: https://alexandrugris.github.io/graphics/3d/2020/04/15/intro-webgl.html

uniform vec3 planetCenter;
uniform float planetRadius;
uniform float atmosphereRadius;
uniform vec3 v3LightPos;

varying float atmosphereThickness;
varying vec3 vLightDirection;
varying vec3 vNormalEyeSpace;

void main(){

    // 1. compute the position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    // 2. compute the thickness of the atmosphere
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection

    vec3 positionW = (modelMatrix * vec4(position, 1.0)).xyz;

    vec3 vCameraPlanet = cameraPosition.xyz - planetCenter;
    vec3 vCameraVertex = normalize(cameraPosition.xyz - positionW);

    float tca = dot(vCameraPlanet, vCameraVertex);

    if (tca < 0.0){
        // not intesect, looking in opposite direction
        atmosphereThickness = 0.0;
        return;
    }

    float dsq = dot(vCameraPlanet, vCameraPlanet) - tca * tca;
    float thc_sq_atmosphere = max(atmosphereRadius * atmosphereRadius - dsq, 0.0);
    float thc_sq_planet = max(planetRadius * planetRadius - dsq, 0.0);

    float thc_atmosphere = 2.0 * sqrt(thc_sq_atmosphere);
    float thc_planet = 2.0 * sqrt(max(0.0, thc_sq_planet));

    float thc = (thc_atmosphere - thc_planet) * 0.12; // density factor

    // 3. the normal light calculation
    vLightDirection = mat3(viewMatrix) * normalize(v3LightPos);
    vNormalEyeSpace = normalize(normalMatrix * normal);

    float dotNL = clamp(dot(vLightDirection, vNormalEyeSpace), 0.0, 1.0);
    atmosphereThickness = thc * dotNL;
}