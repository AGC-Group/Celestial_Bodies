// source: https://alexandrugris.github.io/graphics/3d/2020/04/15/intro-webgl.html

varying float atmosphereThickness;
varying vec3 vLightDirection;
varying vec3 vNormalEyeSpace;

void main(){

    vec3 lightDir = normalize(vLightDirection);
    vec3 normal = normalize(vNormalEyeSpace);

    float lightIntensity = max(dot(normal, lightDir) * 1.5, -0.7);
    gl_FragColor = vec4( (vec3(50.0, 100.0, 150.0) / 256.0) * (1.0 + lightIntensity), atmosphereThickness);
}