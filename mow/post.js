// FRESH CUT — post.js
// A light finishing pass: bloom on the genuinely bright things, a colour grade that warms
// with the afternoon, a little saturation, and a soft vignette. The art underneath is
// unchanged — this only does what a camera would do.
//
// ⚠️ THE ONE THREE.JS FACT THIS HANGS ON: tone mapping is applied only when the render
// target is the canvas (null). So the scene lands in our HDR target as LINEAR light, and
// the composite — which does draw to the canvas — applies ACES + sRGB itself via the
// tonemapping/colorspace chunks (which need material.toneMapped = true). That is why the
// base look is preserved rather than graded twice. Intermediates set toneMapped = false.
import * as THREE from 'three';

const QUAD = new THREE.PlaneGeometry(2, 2);

function pass(uniforms, fragmentShader) {
  const m = new THREE.ShaderMaterial({
    uniforms, fragmentShader, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  });
  m.toneMapped = false;
  return new THREE.Mesh(QUAD, m);
}

export function makePost(renderer) {
  const available = renderer.capabilities.isWebGL2;
  const p = {
    threshold: 0.85,   // LINEAR. This is a bright world — too low and the LAWN glows.
    strength: 0.75,
    vignette: 0.40,
    sat: 1.09,
    warmTint: new THREE.Vector3(1.07, 1.005, 0.90),
  };
  if (!available) return { available: false, p, setSize() {}, render() {}, dispose() {} };

  const size = new THREE.Vector2();
  renderer.getSize(size);
  const rt = (w, h, extra) => new THREE.WebGLRenderTarget(Math.max(2, w | 0), Math.max(2, h | 0),
    { type: THREE.HalfFloatType, depthBuffer: false, stencilBuffer: false, ...extra });

  const sceneRT = rt(size.x, size.y, { depthBuffer: true });
  sceneRT.samples = 4;          // ⚠️ without this, post silently costs you the canvas's MSAA
  let brightRT = rt(size.x / 4, size.y / 4);
  let blurRT = rt(size.x / 4, size.y / 4);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const scene = new THREE.Scene();

  const bright = pass(
    { tDiffuse: { value: sceneRT.texture }, uThreshold: { value: p.threshold } },
    `uniform sampler2D tDiffuse; uniform float uThreshold; varying vec2 vUv;
     void main(){
       vec3 c = texture2D(tDiffuse, vUv).rgb;
       float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
       gl_FragColor = vec4(c * (max(0.0, l - uThreshold) / max(l, 1e-4)), 1.0);
     }`);
  const blur = pass(
    { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2() } },
    `uniform sampler2D tDiffuse; uniform vec2 uDir; varying vec2 vUv;
     void main(){
       vec3 s = texture2D(tDiffuse, vUv).rgb * 0.2270;
       s += (texture2D(tDiffuse, vUv + uDir * 1.3846).rgb + texture2D(tDiffuse, vUv - uDir * 1.3846).rgb) * 0.3162;
       s += (texture2D(tDiffuse, vUv + uDir * 3.2308).rgb + texture2D(tDiffuse, vUv - uDir * 3.2308).rgb) * 0.0702;
       gl_FragColor = vec4(s, 1.0);
     }`);
  const comp = pass(
    {
      tScene: { value: sceneRT.texture }, tBloom: { value: blurRT.texture },
      uStrength: { value: p.strength }, uVig: { value: p.vignette },
      uSat: { value: p.sat }, uWarm: { value: 0 }, uTint: { value: p.warmTint },
    },
    `uniform sampler2D tScene; uniform sampler2D tBloom;
     uniform float uStrength; uniform float uVig; uniform float uSat; uniform float uWarm;
     uniform vec3 uTint; varying vec2 vUv;
     void main(){
       vec3 c = texture2D(tScene, vUv).rgb;
       c += texture2D(tBloom, vUv).rgb * uStrength;
       c *= mix(vec3(1.0), uTint, uWarm);                       // the afternoon going gold
       float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
       c = mix(vec3(l), c, uSat);
       vec2 d = vUv - 0.5;
       c *= 1.0 - uVig * dot(d, d) * 1.7;
       gl_FragColor = vec4(c, 1.0);
       #include <tonemapping_fragment>
       #include <colorspace_fragment>
     }`);
  comp.material.toneMapped = true;   // the ONLY pass that draws to the canvas, so it grades

  function setSize(w, h) {
    size.set(w, h);
    sceneRT.setSize(w, h);
    brightRT.setSize(w / 4, h / 4);
    blurRT.setSize(w / 4, h / 4);
  }
  function draw(mesh, target) {
    scene.clear(); scene.add(mesh);
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
  }
  function render(gameScene, gameCamera, warm = 0) {
    const prevTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(sceneRT);
    renderer.clear();
    renderer.render(gameScene, gameCamera);

    bright.material.uniforms.tDiffuse.value = sceneRT.texture;
    bright.material.uniforms.uThreshold.value = p.threshold;
    draw(bright, brightRT);

    const px = 1 / Math.max(1, brightRT.width), py = 1 / Math.max(1, brightRT.height);
    blur.material.uniforms.tDiffuse.value = brightRT.texture;
    blur.material.uniforms.uDir.value.set(px, 0);
    draw(blur, blurRT);
    blur.material.uniforms.tDiffuse.value = blurRT.texture;
    blur.material.uniforms.uDir.value.set(0, py);
    draw(blur, brightRT);

    const u = comp.material.uniforms;
    u.tScene.value = sceneRT.texture;
    u.tBloom.value = brightRT.texture;
    u.uStrength.value = p.strength; u.uVig.value = p.vignette; u.uSat.value = p.sat;
    u.uWarm.value = warm;
    renderer.setRenderTarget(prevTarget);
    draw(comp, prevTarget);
  }
  function dispose() {
    sceneRT.dispose(); brightRT.dispose(); blurRT.dispose();
    for (const m of [bright, blur, comp]) m.material.dispose();
  }
  return { available: true, p, setSize, render, dispose };
}
