uniform vec3 v3LightPos;
uniform float g;

varying vec3 rayDir;
varying vec3 mie;
varying vec3 rayleigh;

void main () {
	float theta = dot(normalize(v3LightPos), rayDir);
	float rayleighPhase = 0.75 * (1.0 + theta * theta );
	float miePhase = 1.5 * ((1.0 - g * g) / (2.0 + g * g)) * (1.0 + theta * theta) / pow(1.0 + g*g - 2.0 * g * theta, 1.5);

	gl_FragColor = vec4(rayleighPhase * rayleigh + miePhase * mie, 1.0);
}
