import * as THREE from './three.module.js';
// A few broad, tapered translucent ribbons, behind the unchanged bottle orbit.
export function createRibbonBackdrop(scene,variant){
 const group=new THREE.Group();scene.add(group);const ribbons=[];
 const count=variant==='silk'?2:3;
 for(let j=0;j<count;j++){
  const vertices=[],edge=[],segments=140;
  const phase=j*(Math.PI*2/count),start=phase-.9,end=phase+3.5;
  for(let i=0;i<=segments;i++){
   const t=i/segments,a=start+(end-start)*t;
   const taper=Math.sin(Math.PI*t),width=(variant==='silk'?.24:.16)*taper;
   const r=.94+j*.055+Math.sin(a*2+phase)*.09;
   for(const side of [-1,1]){const rr=r+side*width/2;vertices.push(Math.cos(a)*rr*1.16,Math.sin(a)*rr*1.45,0);}
   edge.push(new THREE.Vector3(Math.cos(a)*(r+width/2)*1.16,Math.sin(a)*(r+width/2)*1.45,0));
  }
  const indices=[];for(let i=0;i<segments;i++){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);
  const ribbon=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:j%2?0x9ba78b:0xb9a17c,transparent:true,opacity:variant==='silk'?.15:.12,side:THREE.DoubleSide,depthWrite:false}));ribbon.renderOrder=-4;group.add(ribbon);
  const outline=new THREE.Line(new THREE.BufferGeometry().setFromPoints(edge),new THREE.LineBasicMaterial({color:j%2?0x8e9e7d:0xb59a69,transparent:true,opacity:.28,depthWrite:false}));outline.renderOrder=-3;group.add(outline);ribbons.push([ribbon,outline]);
 }

 const dotted=[];
 if(variant!=='silk'){
  const direction=Math.random()<.5?-1:1;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=16;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(8,8,6,0,Math.PI*2);ctx.fill();const texture=new THREE.CanvasTexture(canvas);
  for(let j=0;j<2;j++){
   const radius=j===0?.99+Math.random()*.08:1.21+Math.random()*.06;
   const points=[];for(let i=0;i<76+j*14;i++){const a=i/(76+j*14)*Math.PI*2;points.push(Math.cos(a)*radius,Math.sin(a)*radius*.85,0);}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
   const orbit=new THREE.Points(geo,new THREE.PointsMaterial({map:texture,color:j===0?0x8a4355:0x96616a,size:j===0?2.3:2,transparent:true,opacity:j===0?.49:.4,depthWrite:false}));orbit.renderOrder=-2;group.add(orbit);
   dotted.push({orbit,phase:Math.random()*Math.PI*2,speed:direction*(j===0?1:-1)*(.08+Math.random()*.035)});
  }
 }
 let expansion=0;
 return (x,y,rx,ry,visible,time,reduced,scrollProgress=0,paused=false)=>{
  if(!paused){const t=Math.min(1,Math.max(0,scrollProgress/.85));expansion=reduced?0:t*t*(3-2*t);}
  group.position.set(x,y,-100);group.scale.set(rx*(1+expansion*.06),ry*(1+expansion*.12),1);group.visible=visible;
  ribbons.forEach(([mesh,line],i)=>{
   const angle=(i-1)*.08+(reduced?0:Math.sin(time*.13+i)*.018)+(i-1)*expansion*.05;
   mesh.rotation.z=line.rotation.z=angle;
   mesh.position.set(Math.cos(i*2.1)*expansion*.025,Math.sin(i*2.1)*expansion*.1,0);line.position.copy(mesh.position);
  });
  dotted.forEach(({orbit,phase,speed})=>{orbit.rotation.z=phase+(reduced?0:time*speed);orbit.material.size=rx<160?1.65:2.2;});
 };
}
