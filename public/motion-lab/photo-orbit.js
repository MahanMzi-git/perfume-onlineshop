import * as THREE from './three.module.js';
import { photoAssets } from './photo-assets.js';
export function mountOrbit({host,hero,docks,status,pause,restart,progress}) {
try{
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);host.append(renderer.domElement);renderer.domElement.style.opacity='0';
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-innerWidth/2,innerWidth/2,innerHeight/2,-innerHeight/2,.1,5000);camera.position.z=2000;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches,time=0,last=0,pointX=0,pointY=0,disposed=false;
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=64;const sc=shadowCanvas.getContext('2d');sc.translate(64,32);sc.scale(2,1);const gradient=sc.createRadialGradient(0,0,1,0,0,32);gradient.addColorStop(0,'rgba(42,32,22,.35)');gradient.addColorStop(.5,'rgba(42,32,22,.13)');gradient.addColorStop(1,'rgba(42,32,22,0)');sc.fillStyle=gradient;sc.fillRect(-32,-32,64,64);const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
const loader=new THREE.TextureLoader(),loads=[];
function makePhoto(asset,height){
 const width=height*asset.width/asset.height,g=new THREE.Group();
 const material=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.012,depthWrite:false,toneMapped:false,side:THREE.DoubleSide});
 const photo=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);photo.renderOrder=2;g.add(photo);
 // A faint offset silhouette adds thickness without revealing invented back faces.
 const backing=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({color:0x5b4934,transparent:true,opacity:.10,depthWrite:false,toneMapped:false}));backing.position.set(.018,-.018,-.025);backing.renderOrder=1;g.add(backing);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(width*1.35,.28),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,toneMapped:false,opacity:.65}));shadow.position.set(.04,-height/2-.06,-.04);g.add(shadow);
 g.userData={height:height+.18,width};scene.add(g);
 loads.push(loader.loadAsync(asset.src).then(texture=>{if(disposed){texture.dispose();return;}texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());material.map=texture;material.needsUpdate=true;backing.material.map=texture;backing.material.needsUpdate=true;}));return g;
}
const central=makePhoto(photoAssets.central,3.15);
const configs=[{kind:'bomba',volume:50},{kind:'creed',volume:100},{kind:'kilian',volume:75},{kind:'dune',volume:30},{kind:'libre',volume:2},{kind:'baccarat',volume:10}];
const bottles=configs.map(c=>makePhoto(photoAssets[c.kind],c.kind==='libre'?2.65:2.8));
Promise.all(loads).then(()=>{if(disposed)return;renderer.domElement.style.opacity='1';host.dataset.ready='true';if(status)status.textContent='PHOTO ORBIT / THREE.JS';}).catch(error=>{if(status)status.textContent='تصاویر در دسترس نیستند';host.dataset.error='true';console.error(error);});
const ringGeometry=new THREE.BufferGeometry(),ringPoints=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;ringPoints.push(new THREE.Vector3(Math.cos(a),Math.sin(a),0));}ringGeometry.setFromPoints(ringPoints);const ring=new THREE.Line(ringGeometry,new THREE.LineBasicMaterial({color:0xb59a69,transparent:true,opacity:.22}));scene.add(ring);
const positions=new Float32Array(100*3);for(let i=0;i<100;i++){const a=i/100*Math.PI*2;positions[i*3]=Math.cos(a);positions[i*3+1]=Math.sin(a);positions[i*3+2]=0;}const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xa2895f,size:1.8,transparent:true,opacity:.35}));scene.add(dust);
function resize(){const w=innerWidth,h=innerHeight;camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,w<700?1.25:1.5));renderer.setSize(w,h,false);}resize();addEventListener('resize',resize);
function updatePause(){if(!pause)return;pause.textContent=paused?'ادامهٔ گردش':'توقف گردش';pause.setAttribute('aria-pressed',String(paused));}updatePause();if(pause)pause.onclick=()=>{paused=!paused;updatePause();};const preferenceChange=()=>{paused=reduced.matches;updatePause();};reduced.addEventListener('change',preferenceChange);if(restart)restart.onclick=()=>scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});
const pointerMove=e=>{if(e.pointerType==='touch')return;pointX=e.clientX/innerWidth-.5;pointY=e.clientY/innerHeight-.5;};addEventListener('pointermove',pointerMove,{passive:true});
const clamp=THREE.MathUtils.clamp,smooth=t=>t*t*(3-2*t);let frames=0;
renderer.setAnimationLoop(ms=>{const dt=Math.min((ms-last)/1000,.04);last=ms;if(document.hidden)return;if(!paused)time+=dt;
const inView=hero.getBoundingClientRect().top<innerHeight && docks[docks.length-1].getBoundingClientRect().bottom>0;host.style.visibility=inView?'visible':'hidden';if(!inView)return;
const w=innerWidth,h=innerHeight,mobile=w<700,heroHeight=hero.offsetHeight,scroll=Math.max(0,-hero.getBoundingClientRect().top);
const copy=hero.querySelector('.hero-copy');const landingMobile=mobile&&hero.classList.contains('orbit-hero');
const cx=w*(mobile?.5:.36),cy=landingMobile?copy.getBoundingClientRect().bottom+155:hero.getBoundingClientRect().top+heroHeight*(mobile?.65:.49),rx=mobile?Math.min(w*.34,145):Math.min(w*.205,300),ry=mobile?80:140;
const global=clamp(scroll/heroHeight,0,1);const centerScale=(mobile?67:105)*.82;central.position.set(cx-w/2,h/2-cy,0);central.scale.setScalar(centerScale*(1-global*.42));central.rotation.y=reduced.matches?0:Math.sin(time*.22)*.12+pointX*.1;central.rotation.z=-.035;central.visible=global<.95;
ring.position.set(cx-w/2,h/2-cy,0);ring.scale.set(rx,ry,1);ring.visible=global<.9;dust.position.copy(ring.position);dust.scale.set(rx*1.08,ry*1.1,1);dust.rotation.z=time*.025;dust.visible=global<.85;
let landed=0;bottles.forEach((b,i)=>{
let t=clamp((scroll-heroHeight*(.10+i*.10))/(heroHeight*.46),0,1);if(reduced.matches)t=t<.5?0:1;const mix=smooth(t),a=time*.18+i*Math.PI/3;const startX=cx+Math.cos(a)*rx,startY=cy+Math.sin(a)*ry;
const rect=docks[i].getBoundingClientRect();const endX=rect.left+rect.width/2,endY=rect.top+rect.height/2-8;
const bend=Math.sin(t*Math.PI)*(mobile?35:80)*(i%2?1:-1);
const x=THREE.MathUtils.lerp(startX,endX,mix)+bend,y=THREE.MathUtils.lerp(startY,endY,mix)-Math.sin(t*Math.PI)*35;
const base=(mobile?29:44)*(configs[i].volume===2?.85:configs[i].volume===10?.78:configs[i].volume===100?1.07:1);
const target=Math.min((rect.height-32)/b.userData.height,(rect.width-30)/b.userData.width)*.86;
b.scale.setScalar(THREE.MathUtils.lerp(base*(1+Math.sin(a)*.12),target,mix));b.position.set(x-w/2,h/2-y,Math.sin(a)*60*(1-mix)+50*mix);
b.rotation.y=reduced.matches?0:THREE.MathUtils.lerp(Math.sin(a)*.10+pointX*.045,0,mix);b.rotation.z=THREE.MathUtils.lerp(Math.cos(a)*.045,0,mix);if(t===1)landed++;
});
if(progress)progress.style.height=clamp(scroll/Math.max(1,document.documentElement.scrollHeight-h),0,1)*100+'%';renderer.render(scene,camera);host.dataset.landed=String(landed);
frames++;
});
return () => {
disposed=true;renderer.setAnimationLoop(null);removeEventListener('resize',resize);removeEventListener('pointermove',pointerMove);reduced.removeEventListener('change',preferenceChange);
scene.traverse(object=>{object.geometry?.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>{material?.map?.dispose();material?.dispose();});});renderer.dispose();renderer.domElement.remove();host.removeAttribute('data-ready');
};
}catch(error){if(status)status.textContent='WebGL در این دستگاه فعال نیست';console.error(error);return ()=>{};}
}
if(document.querySelector('#stage'))mountOrbit({host:document.querySelector('#stage'),hero:document.querySelector('.hero'),docks:[...document.querySelectorAll('.dock')],status:document.querySelector('#status'),pause:document.querySelector('#pause'),restart:document.querySelector('#restart'),progress:document.querySelector('.progress span')});
