#define M_PI 3.141592653589793

uniform vec3 v3LightPos;
uniform vec3 wavelength;
uniform float radius;
uniform float atmosphereHeight;
uniform float rayleighC;
uniform float mieC;
uniform float Isun;

varying vec3 rayDir;
varying vec3 mie;
varying vec3 rayleigh;
varying vec3 viewSamples;

const float samples = 15.0;
const float scaleHeight = 0.03;

// scale for atmospheric density and optical depth calculations
float scale(float x) {
	return exp(5.0 * pow(x, 4.0) - 13.0 * pow(x, 3.0) + 14.0 * pow(x, 2.0) - 9.0 * x + 3.0);
}
float opticalDepth(float h){
	return exp((radius - h) / scaleHeight);
}

// calculate in/out scattering at point along cast camera ray of length len
vec3 viewSampling(vec3 p, vec3 rayDir, float len){
	float h = length(p);	// altitude
	float density = opticalDepth(h);

	// in/out
	float sunScatter = dot(v3LightPos, p) / h;
	float cameraScatter = dot(rayDir, p) / h;
	float lightScatter = density * (scale(sunScatter) - scale(cameraScatter));
	float atmosScale = density * len / atmosphereHeight;

	return atmosScale * exp(-lightScatter * (4.0 * M_PI) * (wavelength * rayleighC + mieC));
}

void main() {
	// get ray to far point of back of atmosphere
	float B = length(position - cameraPosition);
	rayDir = normalize(position - cameraPosition);

	// length of segments
	float len = B / samples;
	vec3 ds = rayDir * len;

	// march through loop
	vec3 viewSamples = vec3(0.0);
	for(float i = 0.0; i < samples; i += 1.0) {
		vec3 p = cameraPosition + i * ds + ds * 0.5;
		viewSamples += viewSampling(p, rayDir, len);
	}

	mie = Isun * mieC * viewSamples;
	rayleigh = Isun * wavelength * rayleighC * viewSamples;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
