import * as THREE from './three.module.js';
const host=document.querySelector('#scene'),status=document.querySelector('#status');
try {
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
host.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.1,100);camera.position.set(0,.4,10);
scene.add(new THREE.HemisphereLight(0xffffff,0x8c7761,3));
const key=new THREE.DirectionalLight(0xffefd8,5);key.position.set(3,5,5);scene.add(key);
const rim=new THREE.DirectionalLight(0xffffff,4);rim.position.set(-4,1,-2);scene.add(rim);
const bottle=new THREE.Group();scene.add(bottle);
const glass=new THREE.MeshPhysicalMaterial({color:0xd3b58e,metalness:.12,roughness:.17,clearcoat:1,clearcoatRoughness:.08,transparent:true,opacity:.66,side:THREE.DoubleSide});
const liquidMat=new THREE.MeshStandardMaterial({color:0xc19a59,metalness:.12,roughness:.24,transparent:true,opacity:.6});
function roundedShape(w,h,r){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
const shape=new THREE.ExtrudeGeometry(roundedShape(1.65,2.25,.23),{depth:.65,bevelEnabled:true,bevelSegments:4,steps:1,bevelSize:.07,bevelThickness:.07,curveSegments:16});shape.translate(0,-.2,-.325);
const body=new THREE.Mesh(shape,glass);bottle.add(body);
const liquid=new THREE.Mesh(new THREE.BoxGeometry(1.42,1.55,.51),liquidMat);liquid.position.y=-.49;bottle.add(liquid);
const goldMat=new THREE.MeshStandardMaterial({color:0xb59a69,metalness:.83,roughness:.22});
const collar=new THREE.Mesh(new THREE.CylinderGeometry(.23,.26,.22,48),goldMat);collar.position.y=1.08;bottle.add(collar);
const cap=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.64,64),new THREE.MeshStandardMaterial({color:0x26211e,metalness:.4,roughness:.25}));cap.position.y=1.49;bottle.add(cap);
const band=new THREE.Mesh(new THREE.CylinderGeometry(.395,.395,.045,64),goldMat);band.position.y=-.25;cap.add(band);
const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=512;const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#f5f0e8';ctx.fillRect(0,0,512,512);ctx.strokeStyle='#b59a69';ctx.lineWidth=2;ctx.strokeRect(22,22,468,468);ctx.textAlign='center';ctx.fillStyle='#201d1a';ctx.font='52px Georgia';ctx.fillText('AROMA',256,170);ctx.font='italic 40px Georgia';ctx.fillText('L’Essence',256,255);ctx.font='16px Arial';ctx.fillText('EAU DE PARFUM',256,355);ctx.fillText('50 ML  /  MOTION STUDY',256,400);
const label=new THREE.Mesh(new THREE.PlaneGeometry(1.08,1.08),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(labelCanvas),toneMapped:false}));label.position.set(0,-.2,.408);bottle.add(label);
const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2,.009,8,150),new THREE.MeshBasicMaterial({color:0xb59a69,transparent:true,opacity:.32}));ring.rotation.x=.7;ring.rotation.y=.35;scene.add(ring);
const count=120,points=new Float32Array(count*3),seeds=[];for(let i=0;i<count;i++){seeds.push({angle:Math.random()*Math.PI*2,radius:1.45+Math.random()*1.4,y:(Math.random()-.5)*4,speed:.08+Math.random()*.12});}
const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(points,3));const dust=new THREE.Points(geo,new THREE.PointsMaterial({color:0xa38b63,size:.027,transparent:true,opacity:.6,depthWrite:false}));scene.add(dust);
let paused=reduced.matches,capOpen=false,time=0,last=0,targetX=0,targetY=0,theme='atelier',progress=0,frames=0;
const modes={atelier:{glass:0xd3b58e,liquid:0xc19a59,dust:0xa38b63},rose:{glass:0xcaa5aa,liquid:0xbd7d8c,dust:0xa96b7c},night:{glass:0x926c42,liquid:0x99602b,dust:0xd6b47b}};
const pause=document.querySelector('#pause');function setPaused(v){paused=v;pause.textContent=v?'ادامهٔ حرکت':'توقف حرکت';pause.setAttribute('aria-pressed',String(v));}setPaused(paused);
pause.onclick=()=>setPaused(!paused);document.querySelector('#cap').onclick=e=>{capOpen=!capOpen;e.currentTarget.setAttribute('aria-pressed',String(capOpen));e.currentTarget.textContent=capOpen?'بستن درپوش':'کشف بطری';};
document.querySelector('#reset').onclick=()=>{capOpen=false;document.querySelector('#cap').setAttribute('aria-pressed','false');document.querySelector('#cap').textContent='کشف بطری';scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});};
document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{theme=button.dataset.mode;document.body.dataset.theme=theme;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;targetX=(e.clientX/innerWidth-.5)*.5;targetY=(e.clientY/innerHeight-.5)*.2;},{passive:true});
addEventListener('scroll',()=>{progress=Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight));},{passive:true});
function resize(){const w=host.clientWidth,h=host.clientHeight;camera.position.z=innerWidth<700?6:10;renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(devicePixelRatio,w<700?1.25:1.5));camera.aspect=w/h;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
reduced.addEventListener('change',()=>setPaused(reduced.matches));
renderer.setAnimationLoop(ms=>{const delta=Math.min((ms-last)/1000,.04);last=ms;if(!paused&&!document.hidden)time+=delta; if(document.hidden)return;
const mobile=innerWidth<700;const motion=paused||reduced.matches?0:1;
bottle.position.x=THREE.MathUtils.lerp(bottle.position.x,mobile?0:-1.65,.06);bottle.position.y=THREE.MathUtils.lerp(bottle.position.y,0+Math.sin(time*.7)*.055*motion,.06);
const scale=mobile?.7:1;bottle.scale.setScalar(scale);bottle.rotation.y=THREE.MathUtils.lerp(bottle.rotation.y,(-.24+progress*.65+targetX)*motion,.06);bottle.rotation.x=THREE.MathUtils.lerp(bottle.rotation.x,targetY*motion,.05);bottle.rotation.z=Math.sin(progress*Math.PI)*.08*motion;
cap.position.y=THREE.MathUtils.lerp(cap.position.y,capOpen?2.4:1.49,.07);
const colors=modes[theme];glass.color.lerp(new THREE.Color(colors.glass),.035);liquidMat.color.lerp(new THREE.Color(colors.liquid),.035);dust.material.color.lerp(new THREE.Color(colors.dust),.035);
ring.position.copy(bottle.position);ring.scale.setScalar(mobile?.73:1);ring.rotation.z=time*.05*motion;dust.position.copy(bottle.position);dust.scale.setScalar(mobile?.7:1);
for(let i=0;i<count;i++){const s=seeds[i],a=s.angle+time*s.speed;points[i*3]=Math.cos(a)*s.radius;points[i*3+1]=s.y+Math.sin(time*.4+s.angle)*.25;points[i*3+2]=Math.sin(a)*s.radius*.6;}geo.attributes.position.needsUpdate=true;renderer.render(scene,camera);
if(++frames===2){host.classList.add('ready');status.textContent='THREE.JS / LIVE 3D';host.dataset.rendered='true';}
});
renderer.domElement.addEventListener('webglcontextlost',()=>{status.textContent='نمای سه‌بعدی موقتاً در دسترس نیست.';host.classList.remove('ready');});
}catch(error){status.textContent='نمای ساده فعال است؛ WebGL در این دستگاه در دسترس نیست.';console.error(error);}
