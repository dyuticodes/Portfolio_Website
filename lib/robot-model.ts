import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

type Point = [number, number, number];

/** Continuous indexed surfaces, rather than stacked primitive body shapes. */
function shellGeometry(profile: Point[], exponent = 2.5, segments = 96, rings = 72) {
  const curve = new THREE.CatmullRomCurve3(profile.map(([y, width, depth]) => new THREE.Vector3(width, y, depth)), false, 'centripetal');
  const positions: number[] = [], uv: number[] = [], indices: number[] = [];
  for (let row = 0; row <= rings; row++) {
    const p = curve.getPoint(row / rings);
    for (let column = 0; column <= segments; column++) {
      const angle = column / segments * Math.PI * 2;
      const sin = Math.sin(angle), cos = Math.cos(angle);
      positions.push(Math.max(.001, p.x) * Math.sign(sin) * Math.abs(sin) ** (2 / exponent), p.y, Math.max(.001, p.z) * Math.sign(cos) * Math.abs(cos) ** (2 / exponent));
      uv.push(column / segments, row / rings);
    }
  }
  for (let row = 0; row < rings; row++) for (let col = 0; col < segments; col++) {
    const a = row * (segments + 1) + col, b = a + segments + 1;
    indices.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // Weld the periodic seam normals without disturbing texture coordinates.
  const normals = geometry.getAttribute('normal');
  for (let row = 0; row <= rings; row++) {
    const first = row * (segments + 1), last = first + segments;
    const normal = new THREE.Vector3().fromBufferAttribute(normals, first).add(new THREE.Vector3().fromBufferAttribute(normals, last)).normalize();
    normals.setXYZ(first, normal.x, normal.y, normal.z);
    normals.setXYZ(last, normal.x, normal.y, normal.z);
  }
  return geometry;
}

export function createRobot() {
  const geometries = new Set<THREE.BufferGeometry>();
  // A woven, anisotropic-looking surface at a deliberately subtle physical scale.
  const pixels = new Uint8Array(128 * 128 * 4);
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const horizontal = (Math.floor(x / 16) + Math.floor(y / 16)) % 2 === 0;
    const across = horizontal ? y % 16 : x % 16;
    const along = horizontal ? x % 16 : y % 16;
    const value = 65 + Math.round(55 * Math.sin(across / 15 * Math.PI) + (along % 4) * 4);
    pixels.set([value, value, value, 255], (y * 128 + x) * 4);
  }
  const weave = new THREE.DataTexture(pixels, 128, 128);
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(8, 8);
  weave.magFilter = THREE.LinearFilter;
  weave.minFilter = THREE.LinearMipmapLinearFilter;
  weave.generateMipmaps = true;
  weave.needsUpdate = true;
  const carbon = new THREE.MeshPhysicalMaterial({ color: 0x17191b, metalness: .65, roughness: .4, clearcoat: .18, clearcoatRoughness: .38, bumpMap: weave, bumpScale: .012 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd1d3d6, metalness: 1, roughness: .105 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x292b2e, metalness: 1, roughness: .17 });
  const black = new THREE.MeshStandardMaterial({ color: 0x080a0c, metalness: .6, roughness: .36 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x050607, metalness: .96, roughness: .085, clearcoat: 1, envMapIntensity: 1.3 });
  const led = new THREE.MeshStandardMaterial({ color: 0xf4f8f6, emissive: 0xd8e3df, emissiveIntensity: 1.2 });
  const root = new THREE.Group();
  function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material | THREE.Material[], at: Point) {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, material);
    object.position.set(...at);
    parent.add(object);
    return object;
  }
  function cylinder(parent: THREE.Object3D, radius: number, length: number, material: THREE.Material, at: Point, axis: 'x' | 'y' = 'y') {
    const object = mesh(parent, new THREE.CylinderGeometry(radius, radius, length, 48), material, at);
    if (axis === 'x') object.rotation.z = Math.PI / 2;
    return object;
  }
  function ball(parent: THREE.Object3D, radius: number, material: THREE.Material, at: Point) {
    return mesh(parent, new THREE.SphereGeometry(radius, 32, 24), material, at);
  }
  function bearing(parent: THREE.Object3D, radius: number, length: number, at: Point, axis: 'x' | 'y' = 'y') {
    cylinder(parent, radius, length, metal, at, axis);
    for (const side of [-1, 1]) {
      const centre: Point = [...at];
      centre[axis === 'x' ? 0 : 1] += side * length * .42;
      cylinder(parent, radius * 1.06, .018, chrome, centre, axis);
    }
  }
  function armour(parent: THREE.Object3D, profile: Point[], at: Point, exponent = 2.5) {
    return mesh(parent, shellGeometry(profile, exponent), carbon, at);
  }

  // Exposed hip axle, spine, and long leg fairings replace the previous pill shapes.
  bearing(root, .18, .78, [0, 1.45, 0], 'x');
  bearing(root, .12, .36, [0, 1.7, 0]);
  for (const side of [-1, 1]) {
    cylinder(root, .022, .32, chrome, [side * .21, 1.71, .07]).rotation.z = side * .15;
    bearing(root, .195, .2, [side * .34, 1.45, 0], 'x');
    cylinder(root, .1, .32, metal, [side * .34, 1.2, 0]);
    bearing(root, .145, .095, [side * .34, 1.21, 0]);
    armour(root, [[-.72,.001,.001],[-.69,.15,.16],[-.5,.19,.2],[-.05,.22,.22],[.02,.18,.18],[.04,.001,.001]], [side * .34, 1.09, 0]);
    bearing(root, .13, .22, [side * .34, .31, 0], 'x');
    armour(root, [[-.53,.001,.001],[-.5,.13,.14],[-.1,.17,.17],[0,.16,.15],[.015,.001,.001]], [side * .34, .18, 0]);
  }
  const body = new THREE.Group();
  body.position.y = 1.88;
  root.add(body);
  armour(body, [[0,.001,.001],[.025,.3,.21],[.08,.36,.24],[.4,.41,.28],[.89,.61,.33],[1.13,.67,.34],[1.26,.51,.29],[1.37,.24,.17],[1.385,.001,.001]], [0,0,0], 2.8);
  bearing(body, .17, .07, [0,1.37,0]);
  cylinder(body, .115, .28, metal, [0,1.5,0]);
  for (const side of [-1,1]) {
    cylinder(body,.022,.28,chrome,[side*.13,1.5,.04]).rotation.z=side*.2;
  }
  const head = new THREE.Group();
  head.position.set(0,1.68,0);
  body.add(head);
  const helmet = shellGeometry([[-.13,.001,.001],[-.11,.19,.16],[-.04,.27,.21],[.21,.345,.285],[.43,.33,.27],[.6,.22,.19],[.64,.001,.001]], 2.65, 128, 96);
  // The visor shares the helmet's exact surface, avoiding intersecting shells.
  const pos = helmet.getAttribute('position');
  const index = helmet.index!;
  const chromeIndices: number[] = [], glassIndices: number[] = [];
  for (let i=0;i<index.count;i+=3) {
    const vertex=index.getX(i), y=pos.getY(vertex), z=pos.getZ(vertex), x=pos.getX(vertex);
    const front=z>-.025 && y>-.065+Math.abs(x)*.035 && y<.605-Math.abs(x)*.08;
    (front ? glassIndices : chromeIndices).push(index.getX(i),index.getX(i+1),index.getX(i+2));
  }
  helmet.setIndex([...chromeIndices,...glassIndices]);
  helmet.addGroup(0,chromeIndices.length,0);
  helmet.addGroup(chromeIndices.length,glassIndices.length,1);
  mesh(head,helmet,[chrome,glass],[0,0,0]);
  const eyes = new THREE.Group(); eyes.position.y=.3; head.add(eyes);
  for(const side of [-1,1]) {
    for(let row=0;row<4;row++) for(let col=0;col<5;col++) {
      const x=side*.132+(col-2)*.018, y=(row-1.5)*.018;
      const z=.286*Math.pow(1-Math.pow(Math.abs(x)/.346,2.65),1/2.65);
      ball(eyes,.0045,led,[x,y,z+.004]);
    }
    // Flush elongated side inset, with a fine machined perimeter.
    const ear=mesh(head,new THREE.TorusGeometry(.125,.012,12,64),chrome,[side*.327,.2,-.02]);
    ear.rotation.y=Math.PI/2; ear.scale.y=1.55;
    const inset=cylinder(head,.115,.024,black,[side*.326,.2,-.02],'x'); inset.scale.x=1.5;
  }
  const arms: THREE.Group[] = [], elbows: THREE.Group[] = [];
  for(const side of [-1,1]) {
    const arm=new THREE.Group(); arm.position.set(side*.72,1.12,0); arm.rotation.z=side*.36; body.add(arm); arms.push(arm);
    bearing(arm,.205,.24,[0,0,0],'x');
    for(let i=0;i<3;i++) cylinder(arm,.15-i*.023,.018,metal,[side*.135,0,0],'x');
    armour(arm,[[-.57,.001,.001],[-.54,.15,.16],[-.32,.205,.22],[.04,.235,.24],[.15,.18,.18],[.17,.001,.001]],[side*.04,-.05,.025],2.7);
    bearing(arm,.09,.22,[0,-.66,0]);
    for(const offset of [-.075,.075]) cylinder(arm,.013,.25,chrome,[offset,-.66,.06]);
    const elbow=new THREE.Group(); elbow.position.y=-.79; elbow.rotation.x=-.55; arm.add(elbow); elbows.push(elbow);
    bearing(elbow,.115,.26,[0,0,0],'x');
    armour(elbow,[[-.48,.001,.001],[-.46,.115,.13],[-.3,.16,.18],[-.08,.19,.2],[.01,.14,.15],[.025,.001,.001]],[0,-.06,.02],2.7);
    bearing(elbow,.074,.13,[0,-.61,.025]);
    const hand=new THREE.Group(); hand.position.set(0,-.72,.03); hand.rotation.x=-.15; hand.rotation.y=-side*.12; elbow.add(hand);
    mesh(hand,new RoundedBoxGeometry(.215,.24,.12,8,.05),metal,[0,0,0]);
    for(let finger=0;finger<4;finger++) {
      const x=(finger-1.5)*.05, length=finger===0||finger===3?.09:.12;
      ball(hand,.026,black,[x,-.105,.005]);
      mesh(hand,new THREE.CapsuleGeometry(.022,length,6,12),metal,[x,-.145-length/2,.012]);
      ball(hand,.022,black,[x,-.16-length,.018]);
      const tip=mesh(hand,new THREE.CapsuleGeometry(.02,.055,6,12),metal,[x,-.205-length,.039]); tip.rotation.x=-.4;
    }
    const thumb=mesh(hand,new THREE.CapsuleGeometry(.032,.14,6,12),metal,[-side*.125,-.05,.065]); thumb.rotation.z=-side*.6;
  }
  return {root,body,head,eyes,arms,elbows,dispose(){geometries.forEach(g=>g.dispose());[carbon,chrome,metal,black,glass,led].forEach(m=>m.dispose());weave.dispose();}};
}

export function createStudio(renderer: THREE.WebGLRenderer) {
  const studio=new THREE.Scene(); studio.background=new THREE.Color(0x111214);
  const panels: THREE.Mesh[]=[];
  for(const [x,y,z,width,height,power] of [[-3,3,4,3,6,3],[4,2,2,1.5,5,2],[0,5,-2,5,3,2]]) {
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({color:new THREE.Color().setScalar(power),side:THREE.DoubleSide}));
    panel.position.set(x,y,z);panel.lookAt(0,2,0);studio.add(panel);panels.push(panel);
  }
  const generator=new THREE.PMREMGenerator(renderer), environment=generator.fromScene(studio,.025);
  panels.forEach(p=>{p.geometry.dispose();(p.material as THREE.Material).dispose();});generator.dispose();return environment;
}
