import * as THREE from './three.module.js';
export function mountOrbit({host,hero,docks,status,pause,restart,progress}) {
try{
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-innerWidth/2,innerWidth/2,innerHeight/2,-innerHeight/2,.1,5000);camera.position.z=2000;
scene.add(new THREE.HemisphereLight(0xffffff,0x8a7860,2.4));const light=new THREE.DirectionalLight(0xfff0dd,3);light.position.set(-400,500,1000);scene.add(light);const rim=new THREE.DirectionalLight(0xffffff,2);rim.position.set(600,200,-400);scene.add(rim);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches,time=0,last=0,pointX=0,pointY=0;
function rounded(w,h,r){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
const gold=new THREE.MeshStandardMaterial({color:0xb59a69,metalness:.78,roughness:.26});
// Reference-inspired lightweight centerpiece: repeated jewels are drawn once into a texture.
function makeJewelledCenterpiece(){
const g=new THREE.Group();
const jewelCanvas=document.createElement('canvas');jewelCanvas.width=1024;jewelCanvas.height=1024;const jc=jewelCanvas.getContext('2d');jc.fillStyle='#aaa69c';jc.fillRect(0,0,1024,1024);
for(let row=0;row<28;row++)for(let col=0;col<32;col++){
 const x=col*33+(row%2)*16.5,y=row*37;
 jc.beginPath();jc.arc(x,y,14,0,Math.PI*2);jc.fillStyle='#3d3b36';jc.fill();
 const gradient=jc.createRadialGradient(x-4,y-5,1,x,y,12);gradient.addColorStop(0,'#ffffff');gradient.addColorStop(.35,'#e9e5da');gradient.addColorStop(.65,'#858780');gradient.addColorStop(.83,'#faf9ee');gradient.addColorStop(1,'#a29d8d');
 jc.beginPath();jc.moveTo(x,y-12);for(let k=1;k<=8;k++){const a=k*Math.PI/4-Math.PI/2;jc.lineTo(x+Math.cos(a)*12,y+Math.sin(a)*12);}jc.fillStyle=gradient;jc.fill();
 jc.strokeStyle='#fffcf3';jc.lineWidth=1;jc.beginPath();jc.moveTo(x-6,y-6);jc.lineTo(x+6,y+6);jc.moveTo(x+6,y-6);jc.lineTo(x-6,y+6);jc.stroke();
}
const jewelTexture=new THREE.CanvasTexture(jewelCanvas);jewelTexture.colorSpace=THREE.SRGBColorSpace;
const jewelMat=new THREE.MeshStandardMaterial({map:jewelTexture,metalness:.48,roughness:.29});
const profile=[new THREE.Vector2(0,-1.35),new THREE.Vector2(.61,-1.35),new THREE.Vector2(.74,-1.23),new THREE.Vector2(.76,.85),new THREE.Vector2(.72,1.03),new THREE.Vector2(.54,1.22),new THREE.Vector2(.29,1.31),new THREE.Vector2(.28,1.45),new THREE.Vector2(0,1.45)];
const glass=new THREE.Mesh(new THREE.LatheGeometry(profile,48),new THREE.MeshPhysicalMaterial({color:0xd2c59d,roughness:.12,metalness:.12,transparent:true,opacity:.6,clearcoat:1}));g.add(glass);
const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.765,.765,2.05,48),jewelMat);sleeve.position.y=-.21;g.add(sleeve);
const cap=new THREE.Mesh(new THREE.CylinderGeometry(.34,.35,.48,40),jewelMat);cap.position.y=1.69;g.add(cap);
const silver=new THREE.MeshStandardMaterial({color:0xc6bb9a,metalness:.82,roughness:.2});
for(const y of [-1.27,.83,1.47,1.93]){const radius=y>1?.35:.765;const band=new THREE.Mesh(new THREE.TorusGeometry(radius,.025,6,48),silver);band.rotation.x=Math.PI/2;band.position.y=y;g.add(band);}
const emblemCanvas=document.createElement('canvas');emblemCanvas.width=512;emblemCanvas.height=512;const ec=emblemCanvas.getContext('2d');ec.clearRect(0,0,512,512);ec.beginPath();ec.moveTo(256,6);ec.lineTo(506,256);ec.lineTo(256,506);ec.lineTo(6,256);ec.closePath();ec.fillStyle='#30291e';ec.fill();ec.strokeStyle='#bba779';ec.lineWidth=7;ec.stroke();ec.fillStyle='#dfcf9e';ec.textAlign='center';ec.font='58px Georgia';ec.fillText('M',256,188);ec.font='33px Georgia';ec.fillText('MORREALE',256,268);ec.font='20px Georgia';ec.fillText('PARIS',256,309);ec.font='italic 18px Georgia';ec.fillText('Le Monde Sur Mesure',256,350);
const emblemTexture=new THREE.CanvasTexture(emblemCanvas);emblemTexture.colorSpace=THREE.SRGBColorSpace;
const emblem=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.08),new THREE.MeshBasicMaterial({map:emblemTexture,transparent:true,depthWrite:false,toneMapped:false}));emblem.position.set(0,-.1,.785);g.add(emblem);
g.children.forEach(part=>part.position.y-=.28);g.scale.setScalar(.82);scene.add(g);return g;
}
const central=makeJewelledCenterpiece();
// Six reference-inspired low-poly category bottles; no remote image hotlinks.
const black=new THREE.MeshStandardMaterial({color:0x202020,roughness:.45,metalness:.1});
const clear=new THREE.MeshPhysicalMaterial({color:0xe8e4cd,transparent:true,opacity:.48,roughness:.12,metalness:.15,clearcoat:1});
function texture(draw){const c=document.createElement('canvas');c.width=512;c.height=512;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function plate(g,w,h,z,draw,y=0){const material=new THREE.MeshBasicMaterial({map:texture(draw),transparent:true,toneMapped:false,depthWrite:false});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);mesh.position.set(0,y,z);g.add(mesh);return mesh;}
function printLabel(ctx,bg,fg,lines){if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,512,512);}ctx.fillStyle=fg;ctx.textAlign='center';lines.forEach((line,i)=>{ctx.font=(i===0?'42':'34')+'px Georgia';ctx.fillText(line,256,130+i*90);});}
function block(g,w,h,d,mat,y=0,r=.12){const geometry=new THREE.ExtrudeGeometry(rounded(w,h,r),{depth:d,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:2,curveSegments:10,steps:1});geometry.translate(0,y,-d/2);const mesh=new THREE.Mesh(geometry,mat);g.add(mesh);return mesh;}
function cylinder(g,r,h,mat,y,segments=32){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat);mesh.position.y=y;g.add(mesh);return mesh;}
const stoneTexture=texture(ctx=>{ctx.fillStyle='#d0c0a4';ctx.fillRect(0,0,512,512);let seed=17;for(let i=0;i<3800;i++){seed=(seed*16807)%2147483647;const x=seed%512;seed=(seed*16807)%2147483647;const y=seed%512;ctx.fillStyle=i%3?'#b4a58a':'#eee0c7';ctx.globalAlpha=.25;ctx.fillRect(x,y,2+i%5,2+i%4);}ctx.globalAlpha=1;});
const stone=new THREE.MeshStandardMaterial({map:stoneTexture,roughness:1});
function makeReferenceBottle(kind){const g=new THREE.Group();
if(kind==='bomba'){
const pink=new THREE.MeshPhysicalMaterial({color:0xa91658,metalness:.2,roughness:.12,clearcoat:1,transparent:true,opacity:.88});
const wing=new THREE.Shape();wing.moveTo(0,0);wing.bezierCurveTo(.15,.5,.38,1.2,.85,1.35);wing.bezierCurveTo(1.22,1.52,1.17,.75,1.03,.25);wing.bezierCurveTo(.98,-.03,.72,-.08,.78,-.23);wing.bezierCurveTo(1.17,-.45,1.06,-1.18,.68,-1.14);wing.bezierCurveTo(.25,-1.1,.2,-.4,0,0);
const wingGeo=new THREE.ExtrudeGeometry(wing,{depth:.35,bevelEnabled:true,bevelSegments:3,bevelSize:.07,bevelThickness:.07,curveSegments:16,steps:1});wingGeo.translate(0,0,-.18);
for(const side of [-1,1]){const mesh=new THREE.Mesh(wingGeo,pink);mesh.scale.x=side;g.add(mesh);const vein=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,.25),new THREE.Vector3(.55*side,.55,.27),new THREE.Vector3(.94*side,1.23,.24)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(vein,12,.014,4,false),gold));}
cylinder(g,.24,1.18,new THREE.MeshStandardMaterial({color:0xe7a6af,roughness:.25}),0);cylinder(g,.27,.06,gold,.62);cylinder(g,.27,.06,gold,-.62);
plate(g,.27,.95,.27,ctx=>{printLabel(ctx,null,'#856528',['CH','LA','BOMBA']);},0);
}else if(kind==='creed'){
block(g,1.48,1.75,.65,clear,-.15);const shoulder=new THREE.Shape();shoulder.moveTo(-.74,.6);shoulder.quadraticCurveTo(-.5,.78,-.22,.92);shoulder.lineTo(-.2,1.08);shoulder.lineTo(.2,1.08);shoulder.quadraticCurveTo(.3,.78,.74,.6);shoulder.closePath();const geom=new THREE.ExtrudeGeometry(shoulder,{depth:.6,bevelEnabled:false});geom.translate(0,0,-.3);g.add(new THREE.Mesh(geom,clear));
block(g,1.49,1.05,.67,black,-.48,.07);const cap=new THREE.Mesh(new THREE.CylinderGeometry(.33,.24,.68,5),black);cap.position.y=1.43;g.add(cap);
plate(g,1.18,.46,.38,ctx=>printLabel(ctx,null,'#292b27',['CREED']),.55);
plate(g,.94,.48,.39,ctx=>printLabel(ctx,'#e7e6dd','#222222',['AVENTUS','FRANCE']),-.48);
}else if(kind==='kilian'){
const amber=new THREE.MeshPhysicalMaterial({color:0xb88938,roughness:.13,metalness:.15,clearcoat:1,transparent:true,opacity:.8});cylinder(g,.72,1.65,amber,-.25,16);cylinder(g,.73,.15,clear,-1.12,16);cylinder(g,.75,.86,clear,1.01,16);cylinder(g,.17,.7,gold,1.03,16);
for(let j=0;j<12;j++){const pts=[];for(let k=0;k<16;k++){const a=j*Math.PI/6+k*.065;pts.push(new THREE.Vector3(Math.sin(a)*.736,-1+k*.16,Math.cos(a)*.736));}const geo=new THREE.BufferGeometry().setFromPoints(pts);g.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xe3ce93,transparent:true,opacity:.65})));}
plate(g,1.03,1.08,.76,ctx=>{ctx.fillStyle='#a98945';ctx.beginPath();ctx.moveTo(256,0);ctx.lineTo(512,256);ctx.lineTo(256,512);ctx.lineTo(0,256);ctx.fill();printLabel(ctx,null,'#fff3cd',["ANGELS’",'SHARE','Kilian']);},-.15);
}else if(kind==='dune'){
block(g,1.4,1.95,.65,new THREE.MeshPhysicalMaterial({color:0xa36828,metalness:.15,roughness:.17,clearcoat:1}),-.12);cylinder(g,.23,.2,gold,1.02);block(g,.78,.52,.68,stone,1.4,.06);
const shell=new THREE.Shape();shell.moveTo(-.74,-1.14);shell.lineTo(.74,-1.14);shell.lineTo(.74,-.23);shell.lineTo(.5,-.45);shell.lineTo(.24,-.52);shell.lineTo(-.13,-.7);shell.lineTo(-.42,-.26);shell.lineTo(-.74,-.13);shell.closePath();const shellGeo=new THREE.ExtrudeGeometry(shell,{depth:.1,bevelEnabled:false});shellGeo.translate(0,0,.34);g.add(new THREE.Mesh(shellGeo,stone));
const crack=new THREE.CatmullRomCurve3([new THREE.Vector3(-.48,-1.05,.46),new THREE.Vector3(-.18,-.65,.46),new THREE.Vector3(.2,-.38,.46),new THREE.Vector3(.54,-.15,.46)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(crack,14,.035,4,false),gold));
plate(g,1.13,.5,.39,ctx=>printLabel(ctx,null,'#edd49a',['DUNECRY','EXTRAIT DE PARFUM']),.48);
}else if(kind==='libre'){
cylinder(g,.19,2.45,new THREE.MeshPhysicalMaterial({color:0xe3c565,roughness:.13,transparent:true,opacity:.75,clearcoat:1}),-.22);cylinder(g,.205,.24,gold,1.1);cylinder(g,.175,.36,black,1.4);
plate(g,.32,1.88,.205,ctx=>{printLabel(ctx,null,'#8a6a23',['LIBRE','YSL']);ctx.font='20px Arial';ctx.fillText('EAU DE PARFUM',256,430);},-.25);
}else if(kind==='baccarat'){
block(g,1.5,1.75,.68,new THREE.MeshPhysicalMaterial({color:0x9a0b20,roughness:.13,metalness:.15,clearcoat:1}),-.25,.08);cylinder(g,.29,.22,gold,.8);cylinder(g,.36,.49,gold,1.15);
plate(g,1.17,1.2,.405,ctx=>{printLabel(ctx,'#d8b553','#662b19',['Maison Francis','Kurkdjian Paris','Baccarat','Rouge 540']);},-.2);
}
// Center each silhouette and retain real extents for responsive docking.
const bounds=new THREE.Box3().setFromObject(g),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());g.children.forEach(part=>part.position.sub(center));g.userData={height:size.y,width:size.x};scene.add(g);return g;}
const configs=[{kind:'bomba',volume:50},{kind:'creed',volume:100},{kind:'kilian',volume:75},{kind:'dune',volume:30},{kind:'libre',volume:2},{kind:'baccarat',volume:10}];
const bottles=configs.map(config=>makeReferenceBottle(config.kind));
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
const base=(mobile?29:44)*(configs[i].volume===2?.65:configs[i].volume===10?.78:configs[i].volume===100?1.07:1);
const target=Math.min((rect.height-32)/b.userData.height,(rect.width-30)/b.userData.width)*.86;
b.scale.setScalar(THREE.MathUtils.lerp(base*(1+Math.sin(a)*.12),target,mix));b.position.set(x-w/2,h/2-y,Math.sin(a)*60*(1-mix)+50*mix);
b.rotation.y=reduced.matches?0:THREE.MathUtils.lerp(Math.sin(a)*.22+pointX*.08,0,mix);b.rotation.z=THREE.MathUtils.lerp(Math.cos(a)*.08,0,mix);if(t===1)landed++;
});
if(progress)progress.style.height=clamp(scroll/Math.max(1,document.documentElement.scrollHeight-h),0,1)*100+'%';renderer.render(scene,camera);host.dataset.landed=String(landed);
if(++frames===2){host.dataset.ready='true';if(status)status.textContent='SCENT ORBIT / THREE.JS';}
});
return () => {
renderer.setAnimationLoop(null);removeEventListener('resize',resize);removeEventListener('pointermove',pointerMove);reduced.removeEventListener('change',preferenceChange);
scene.traverse(object=>{object.geometry?.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(material=>{material?.map?.dispose();material?.dispose();});});renderer.dispose();renderer.domElement.remove();host.removeAttribute('data-ready');
};
}catch(error){if(status)status.textContent='WebGL در این دستگاه فعال نیست';console.error(error);return ()=>{};}
}
if(document.querySelector('#stage'))mountOrbit({host:document.querySelector('#stage'),hero:document.querySelector('.hero'),docks:[...document.querySelectorAll('.dock')],status:document.querySelector('#status'),pause:document.querySelector('#pause'),restart:document.querySelector('#restart'),progress:document.querySelector('.progress span')});
