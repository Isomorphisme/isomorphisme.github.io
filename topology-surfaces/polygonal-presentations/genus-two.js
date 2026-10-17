/* Connected sum of two genuinely punctured tori, with a circular gluing seam. */
(function(root){
'use strict';
const TAU=2*Math.PI,beta=Math.atan(.30/.80),R=1.2,r=.42,neck=.40,cutPlane=1.60;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t);
function parameters(a,q){
 const s=clamp((a-beta)/TAU),edge=Math.min(3,Math.floor(s*4)),t=s*4-edge;let x,y;
 if(edge===0){x=Math.PI-TAU*t;y=Math.PI;}else if(edge===1){x=-Math.PI;y=Math.PI-TAU*t;}else if(edge===2){x=-Math.PI+TAU*t;y=-Math.PI;}else{x=Math.PI;y=-Math.PI+TAU*t;}
 const outer=Math.hypot(x/.30,y/.80),rho=1+q*(outer-1);
 return {theta:x*rho/outer,phi:y*rho/outer,rho};
}
function build({data,top,flat}){
 const mesh=[],lines=[],labels=[],halves=[[0,1,2,3,4],[4,5,6,7,0]].map(ids=>ids.map(i=>flat[0][i]));
 function flatPoint(h,a,q){
  const {theta,phi}=parameters(a,1),eps=1e-8;let edge,t;
  if(a>=beta+TAU-1e-9){edge=3;t=1;}
  else if(Math.abs(phi-Math.PI)<eps){edge=0;t=(Math.PI-theta)/TAU;}
  else if(Math.abs(theta+Math.PI)<eps){edge=1;t=(Math.PI-phi)/TAU;}
  else if(Math.abs(phi+Math.PI)<eps){edge=2;t=(theta+Math.PI)/TAU;}
  else{edge=3;t=(phi+Math.PI)/TAU;}
  const poly=halves[h],inner=mix(poly[0],poly[4],(a-beta)/TAU),outer=mix(poly[edge],poly[edge+1],clamp(t));
  return mix(inner,outer,q);
 }
 function point(v,t){
  const {half:h,a,q}=v.genus,side=h===0?-1:1,initial=flatPoint(h,a,q),separate=ease(t/.18);
  const unfolded=[initial[0]+side*3.0*separate,initial[1],initial[2]];
  if(t<=.18)return unfolded;
  const closing=ease((t-.76)/.24),C=3.70+(cutPlane-3.70)*closing,{theta,phi,rho}=parameters(a,q),zSign=h===0?1:-1;
  // Glue the phi-periodic pair first: this is a cylinder, with the e disc
  // already cut out of its side. Only then bend the theta axis into a circle.
  const bend=ease((t-.46)/.22),length=4.60+(TAU*R-4.60)*bend;
  let surface;
  if(bend<1e-6)surface=[side*(C-r*Math.cos(phi)),length*theta/TAU,zSign*r*Math.sin(phi)];
  else{const major=length/(TAU*bend),angle=theta*bend,offset=major*Math.sin(Math.PI*bend)/(Math.PI*bend);
   surface=[side*(C-(major+r*Math.cos(phi))*Math.cos(angle)+offset),(major+r*Math.cos(phi))*Math.sin(angle),zSign*r*Math.sin(phi)];}
  // Preserve an open circular e boundary during both forming stages.
  const radius=.30+(neck-.30)*bend,plane=(r-.04)*(1-bend)+cutPlane*bend,collar=.12+.12*bend;
  const circle=[side*(C-plane+collar*(rho-1)),radius*Math.cos(a-beta),zSign*radius*Math.sin(a-beta)];
  const punctured=mix(circle,surface,ease((rho-1)/.80));
  return mix(unfolded,punctured,ease((t-.18)/.22));
 }
 function vertex(half,a,q){const v={genus:{half,a,q}};v.start=flatPoint(half,a,q);v.end=point(v,1);return v;}
 const angles=Array.from({length:161},(_,i)=>beta+TAU*i/160),radial=26;
 for(let h=0;h<2;h++)for(let i=0;i<angles.length-1;i++)for(let j=0;j<radial;j++){
  const a=vertex(h,angles[i],j/radial),b=vertex(h,angles[i+1],j/radial),c=vertex(h,angles[i+1],(j+1)/radial),d=vertex(h,angles[i],(j+1)/radial),color=h===0?'#88ad92':'#85a8be';
  mesh.push({v:[a,b,c],color,face:h},{v:[a,c,d],color,face:h});
 }
 function edgeVertex(h,e,t){return vertex(h,beta+TAU*(e+t)/4,1);}

 for(let h=0;h<2;h++){
  for(let e=0;e<4;e++){
   const original=top.words[0][h*4+e],at=t=>edgeVertex(h,e,t);
   for(let i=0;i<64;i++)lines.push({v:[at(i/64),at((i+1)/64)],label:original.label,face:h});
   labels.push({point:at(.5),forward:at(.5+.045*original.sign),back:at(.5-.045*original.sign),text:original.label+(original.sign<0?'⁻¹':''),label:original.label,face:h});
  }
  for(let i=0;i<160;i++)lines.push({v:[vertex(h,beta+TAU*i/160,0),vertex(h,beta+TAU*(i+1)/160,0)],label:'e',face:h,cut:true});
  const direction=h===0?-1:1;
  labels.push({point:vertex(h,beta+Math.PI,0),forward:vertex(h,beta+Math.PI+direction*.08,0),back:vertex(h,beta+Math.PI-direction*.08,0),text:h===0?'e':'e⁻¹',label:'e',face:h});
 }
 return {data,top,flat,mesh,lines,labels,position:point,vertex,parameters,angles,radial};
}
const api={build,beta};if(typeof module!=='undefined')module.exports=api;else root.GenusTwo=api;
})(typeof globalThis!=='undefined'?globalThis:this);
