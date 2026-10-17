/* Shared mathematical mesh construction; also loadable by Node for verification. */
(function(root){
'use strict';
const cases=[
 {key:'a',name:'Three crosscaps',surface:'N₃ = ℝP² # ℝP² # ℝP²',words:['a b a c b- c-'],V:1,E:3,F:1,chi:-1,orientable:false,description:'A hexagon with a repeated in the same direction. Its quotient is nonorientable with three crosscaps. The folded 3D model keeps every prescribed seam; crossings are only overlaps in space.'},
 {key:'b',name:'Torus',surface:'T² = S¹ × S¹',words:['a b c a- b- c-'],V:2,E:3,F:1,chi:0,orientable:true,description:'Opposite sides of this hexagon are paired by translations. Wrap the two independent translation coordinates around circles to obtain a torus.'},
 {key:'c',name:'Sphere',surface:'S²',words:['a b c','b d e','c- d f','e- f a'],V:4,E:6,F:4,chi:2,orientable:true,description:'These four triangles assemble as the boundary of a tetrahedron. The final rounding changes its shape, not its topology: it is a sphere.'},
 {key:'d',name:'Projective plane',surface:'ℝP²',words:['a b c','b d e','d f g','f h i','h a j','c- k l','e- m n','g- o k-','i- l- m-','j- n- o-'],V:6,E:15,F:10,chi:1,orientable:false,description:'Ten triangles form the six-vertex triangulation of the projective plane. The final model is a Roman-surface map of the antipodal sphere quotient, with self-intersections and singular points.'}
];
cases.push(
 {key:'genus2',name:'Genus 2 surface',surface:'Σ₂ = T² # T²',words:['a b a- b- c d c- d-'],V:1,E:4,F:1,chi:-2,orientable:true,description:'Cut the octagon along e into two pentagons. First glue a on the left and c on the right to form cylinders, keeping the e openings. Then bend the cylinders and glue b and d to make punctured tori. Finally join their e boundary circles to form T² # T².',explanation:{reason:'Each edge occurs once in each orientation, so an orientation of the octagon descends to the surface.',equation:'We have −2 = χ(Σ<sub>g</sub>) = 2 − 2g, hence g = 2.',result:'This presents the orientable surface Σ<sub>2</sub> = T² # T², the genus 2 surface.'}},
 {key:'klein',name:'Klein bottle',surface:'K = N₂',words:['a b a b-'],V:1,E:2,F:1,chi:0,orientable:false,description:'First glue the b edges without a twist to make a cylinder. Then identify its two a boundary circles with reversed directions: the two a edges have the same boundary orientation. The cylinder widens into a bottle; its neck bends back and passes through the side to join the other end. Crossings do not identify additional points.',explanation:{reason:'The edge a occurs twice with the same orientation, so the surface is not orientable.',equation:'We have 0 = χ(Nₖ) = 2 − k, hence k = 2.',result:'This presents the non-orientable surface N₂ = ℝP² # ℝP², the Klein bottle.'}}
);
cases.push({key:'square-torus',name:'Torus',surface:'T² = S¹ × S¹',words:['a b a- b-'],V:1,E:2,F:1,chi:0,orientable:true,description:'First identify the a edges to make a cylinder. Then bring its two b boundary circles together without a twist. Both pairs of opposite sides now form seams on the torus.',explanation:{reason:'Each edge occurs once in each orientation, so an orientation of the square descends to the surface.',equation:'We have 0 = χ(Σ<sub>g</sub>) = 2 − 2g, hence g = 1.',result:'This presents the orientable surface Σ<sub>1</sub> = T², the torus.'}});
function squarePoint(u,v,t){
 const ease=x=>x*x*(3-2*x),curl=ease(Math.min(1,t*2)),bend=ease(Math.max(0,t*2-1)),A=2*Math.PI*curl;
 let x=A<1e-5?4*(u-.5):4*Math.sin((u-.5)*A)/A;
 let z=A<1e-5?0:4*(Math.cos((u-.5)*A)-Math.sin(A/2)/(A/2))/A;
 let y=4*(v-.5);
 if(bend>1e-6){const B=2*Math.PI*bend,L=4+4*bend,R=L/B,phi=(v-.5)*B;y=(R+z)*Math.sin(phi);z=(R+z)*Math.cos(phi)-R*Math.sin(B/2)/(B/2);}
 return [x,y,z];
}
// The profile follows the bottle-shaped construction in the user's reference:
// https://commons.wikimedia.org/wiki/File:Klein_bottle.svg (Tttrung).
// Here it is swept with moving circular frames, rather than interpolating a
// cylinder directly into a figure-eight surface.
function bottleProfile(v){
 const w=4*Math.PI*v;let x=0,y,radius,angle=0;
 if(w<Math.PI){radius=2.5-1.5*Math.cos(w);y=-2.5*Math.sin(w);}
 else if(w<2*Math.PI){radius=2.5-1.5*Math.cos(w);y=3*(w-Math.PI);}
 else if(w<3*Math.PI){radius=1;angle=w-2*Math.PI;x=-2+2*Math.cos(w);y=3*Math.PI+2*Math.sin(w);}
 else{radius=1;angle=Math.PI;x=-2+2*Math.cos(w);y=3*(4*Math.PI-w);}
 return {center:[(x+.5)*.28,(y-4.96)*.28,0],radius:radius*.28,angle};
}
function kleinPoint(u,v,t){
 const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);},L=1.75*Math.SQRT2;
 if(t<=.5){const A=2*Math.PI*ease(t*2),x=A<1e-5?L*(u-.5):L*Math.sin((u-.5)*A)/A,z=A<1e-5?0:L*(Math.cos((u-.5)*A)-Math.sin(A/2)/(A/2))/A,y=L*(v-.5);return [(-x+y)/Math.SQRT2,(-x-y)/Math.SQRT2,z];}
 if(t>=.90){const shift=.10*ease((t-.90)/.10)*(1-Math.cos(2*Math.PI*u));let U=u,V=v+shift;if(V>1){V-=1;U=1-U;}const profile=bottleProfile(V),phi=2*Math.PI*U+Math.PI/2;return profile.center.map((x,i)=>x+profile.radius*(Math.cos(phi)*[Math.cos(profile.angle),Math.sin(profile.angle),0][i]+Math.sin(phi)*[0,0,1][i]));}
 const inflate=ease((t-.5)/.12),bend=ease((t-.62)/.28),profile=bottleProfile(v),phi=2*Math.PI*u+Math.PI/2;
 // Rotate an orthonormal cylinder frame as a rigid frame, so cross-sections
 // never collapse into a line while the bottle is inflated and reoriented.
 function frame(p){const az=-Math.PI/4*inflate,ay=Math.PI*inflate,x=p[0]*Math.cos(az)-p[1]*Math.sin(az),y=p[0]*Math.sin(az)+p[1]*Math.cos(az);return [x*Math.cos(ay)+p[2]*Math.sin(ay),y,-x*Math.sin(ay)+p[2]*Math.cos(ay)];}
 const axis=frame([1/Math.SQRT2,-1/Math.SQRT2,0]),normal=frame([-1/Math.SQRT2,-1/Math.SQRT2,0]),binormal=frame([0,0,-1]),length=L+(4-L)*inflate;
 const straight=axis.map(x=>x*length*(v-.5)),center=straight.map((x,i)=>x*(1-bend)+profile.center[i]*bend);
 // Make the moving neck swing broadly around the body before returning.
 center[0]-=.55*Math.sin(Math.PI*bend)*Math.sin(Math.PI*Math.max(0,(v-.5)*2));
 const radius=L/(2*Math.PI)+(profile.radius-L/(2*Math.PI))*inflate;
 const n=bend>0?[Math.cos(profile.angle*bend),Math.sin(profile.angle*bend),0]:normal;
 return center.map((x,i)=>x+radius*(Math.cos(phi)*n[i]+Math.sin(phi)*binormal[i]));
}
function deformSpace(p,t,index){
 // Sequential shears are invertible: they spread planar seam curves through
 // space without changing identifications or creating collapsed material.
 if(index===4)return p;
 const final=[.60,.40,0,.30,0,0,.35][index]||0;
 const amount=.85*Math.sin(Math.PI*t)+final*t*t*(3-2*t),q=p.slice();
 q[2]+=amount*(.27*Math.sin(1.1*q[0]+.65*q[1])+.10*Math.sin(1.4*q[1]));
 q[0]+=amount*.16*Math.sin(.9*q[1]+.7*q[2]);
 q[1]+=amount*.12*Math.sin(1.1*q[2]);return q;
}

const add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,s)=>a.map(x=>x*s),mix=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),norm=a=>mul(a,1/Math.hypot(...a));
function topology(data){
 const words=data.words.map(w=>w.split(' ').map(x=>({label:x[0],sign:x.endsWith('-')?-1:1}))),offset=[];let total=0;
 words.forEach(w=>{offset.push(total);total+=w.length;});
 const parent=Array.from({length:total},(_,i)=>i),find=x=>parent[x]===x?x:(parent[x]=find(parent[x])),join=(a,b)=>parent[find(a)]=find(b),edges={};
 words.forEach((w,f)=>w.forEach((e,i)=>{const p=offset[f]+i,q=offset[f]+(i+1)%w.length,ends=e.sign===1?[p,q]:[q,p];(edges[e.label]??=[]).push({f,i,ends});}));
 Object.values(edges).forEach(pair=>{join(pair[0].ends[0],pair[1].ends[0]);join(pair[0].ends[1],pair[1].ends[1]);});
 const classes=[...new Set(parent.map((_,i)=>find(i)))],vertices=words.map((w,f)=>w.map((_,i)=>classes.indexOf(find(offset[f]+i))));
 // Propagate face orientations across glued edges; contradictions detect nonorientability.
 const signs=Array(words.length).fill(0);let orientable=true;
 for(let start=0;start<words.length;start++)if(!signs[start]){signs[start]=1;let queue=[start];while(queue.length){const f=queue.pop();Object.values(edges).forEach(([a,b])=>{if(a.f!==f&&b.f!==f)return;const other=a.f===f?b:a,here=a.f===f?a:b,required=-signs[f]*words[here.f][here.i].sign*words[other.f][other.i].sign;if(signs[other.f]&&signs[other.f]!==required)orientable=false;else if(!signs[other.f]){signs[other.f]=required;queue.push(other.f);}});}}
 return {words,vertices,edges,V:classes.length,E:Object.keys(edges).length,F:words.length,orientable};
}
function build(index){
 const data=cases[index],top=topology(data),mesh=[],lines=[],labels=[],faceColors=['#88ad92','#c8aa78','#85a8be','#b393ac','#a5b970','#ca947e','#83b9b1','#ab9bc0','#c4b98b','#90a9ba'];
 const n=top.words.length,cols=n===10?5:n===4?2:1,rows=Math.ceil(n/cols),radius=n===1?1.75:.69;
 const flat=top.words.map((w,f)=>w.map((_,i)=>{let angle=Math.PI/2+2*Math.PI*i/w.length;return [(f%cols-(cols-1)/2)*1.6+radius*Math.cos(angle),((rows-1)/2-Math.floor(f/cols))*1.8+radius*Math.sin(angle),0];}));
 if(index===6)flat[0]=[[2,-2,0],[2,2,0],[-2,2,0],[-2,-2,0]];
 if(index===4){const genusTwo=typeof module!=='undefined'?require('./genus-two.js'):root.GenusTwo;return genusTwo.build({data,top,flat});}
 const tetra=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]];
 let representatives=null,faceSigns=null;
 if(index===3){
  const phi=(1+Math.sqrt(5))/2,axes=[[0,1,phi],[0,-1,phi],[1,phi,0],[-1,phi,0],[phi,0,1],[phi,0,-1]].map(norm);
  function search(p,remaining){if(!remaining.length){if(top.vertices.every(([a,b,c])=>dot(axes[p[a]],axes[p[b]])*dot(axes[p[b]],axes[p[c]])*dot(axes[p[c]],axes[p[a]])>0))return p;return null;}for(const a of remaining){const out=search([...p,a],remaining.filter(x=>x!==a));if(out)return out;}return null;}
  const permutation=search([],[0,1,2,3,4,5]);if(!permutation)throw Error('Projective triangulation mismatch');
  representatives=permutation.map(i=>axes[i]);faceSigns=top.vertices.map(v=>[1,Math.sign(dot(representatives[v[0]],representatives[v[1]])),Math.sign(dot(representatives[v[0]],representatives[v[2]]))]);
 }
 function target(f,weights){
  if(index===6){const p=weights.reduce((a,t,i)=>add(a,mul(flat[f][i],t)),[0,0,0]);return squarePoint((p[0]+2)/4,(p[1]+2)/4,1);}
  if(index===5)return kleinPoint(weights[1]+weights[2],weights[2]+weights[3],1);
  if(index===1){const p=weights.reduce((a,t,i)=>add(a,mul(flat[f][i],t)),[0,0,0]);const v=flat[0],t0=add(v[0],mul(v[4],-1)),t1=add(v[1],mul(v[5],-1)),det=t0[0]*t1[1]-t0[1]*t1[0],u=(p[0]*t1[1]-p[1]*t1[0])/det,vv=(t0[0]*p[1]-t0[1]*p[0])/det,A=2*Math.PI*u,B=2*Math.PI*vv;return [(1.35+.52*Math.cos(B))*Math.cos(A),(1.35+.52*Math.cos(B))*Math.sin(A),.52*Math.sin(B)];}
  if(index===2){const p=weights.reduce((a,t,i)=>add(a,mul(tetra[top.vertices[f][i]],t)),[0,0,0]);return mul(norm(p),1.65);}
  if(index===3){const p=norm(weights.reduce((a,t,i)=>add(a,mul(representatives[top.vertices[f][i]],t*faceSigns[f][i])),[0,0,0]));return [3.5*p[1]*p[2],3.5*p[2]*p[0],3.5*p[0]*p[1]];}
 }
 function vertex(f,weights){const v={start:weights.reduce((a,t,i)=>add(a,mul(flat[f][i],t)),[0,0,0]),end:target(f,weights)};if(index===5)v.kleinUV=[weights[1]+weights[2],weights[2]+weights[3]];if(index===6)v.uv=[(v.start[0]+2)/4,(v.start[1]+2)/4];if(index===2)v.middle=weights.reduce((a,t,i)=>add(a,mul(tetra[top.vertices[f][i]],t*.95)),[0,0,0]);return v;}
 function triangle(a,b,c,f){mesh.push({v:[a,b,c],color:faceColors[f%faceColors.length],face:f});}
 const resolution=index===5?64:index===6?32:index===1?24:14;
 if(index===5){
  const U=64,V=160,at=(u,v)=>vertex(0,[(1-u)*(1-v),u*(1-v),u*v,(1-u)*v]);
  for(let i=0;i<U;i++)for(let j=0;j<V;j++){const a=at(i/U,j/V),b=at((i+1)/U,j/V),c=at((i+1)/U,(j+1)/V),d=at(i/U,(j+1)/V);triangle(a,b,c,0);triangle(a,c,d,0);}
 }else if(index!==0){
  // Fan each polygon into triangles, preserving its original boundary.
  top.words.forEach((word,f)=>{const count=word.length,center=Array(count).fill(1/count);
   for(let edge=0;edge<count;edge++){
    const sample=(i,j)=>{const w=center.map(x=>x*(1-(i+j)/resolution));w[edge]+=i/resolution;w[(edge+1)%count]+=j/resolution;return vertex(f,w);};
    for(let i=0;i<resolution;i++)for(let j=0;j<resolution-i;j++){triangle(sample(i,j),sample(i+1,j),sample(i,j+1),f);if(i+j<resolution-1)triangle(sample(i+1,j),sample(i+1,j+1),sample(i,j+1),f);}
   }
  });
 }else{
  // A subdivided disc with six independent inner strips. Equal edge parameters
  // share targets, while the two incident face interiors remain separate.
  const base=[0,0,1.55],edgeNames=Object.keys(top.edges),sides=top.words[0].length;
  function loop(label,t){
   const j=edgeNames.indexOf(label),angle=j*2*Math.PI/3,theta=2*Math.PI*t,r=1.1*(1-Math.cos(theta));return [r*Math.cos(angle)+.4*Math.sin(theta)*Math.sin(angle),r*Math.sin(angle)-.4*Math.sin(theta)*Math.cos(angle),1.55-1.5*Math.sin(Math.PI*t)**2+.35*Math.sin(theta)];}
  for(let e=0;e<sides;e++){
   const edge=top.words[0][e],a=flat[0][e],b=flat[0][(e+1)%sides],S=16,R=8;
   const sample=(i,j)=>{const t=i/S,r=j/R,bound=mix(a,b,t),endBoundary=i===0||i===S?base:loop(edge.label,edge.sign===1?t:1-t),angle=Math.PI/2+2*Math.PI*(e+t)/sides;
    const ring=[1.2*Math.cos(angle),1.2*Math.sin(angle),-1.15+.2*Math.sin(3*angle)];return {start:mul(bound,1-.65*r),end:mix(endBoundary,ring,r)};};
   for(let i=0;i<S;i++)for(let j=0;j<R;j++){triangle(sample(i,j),sample(i+1,j),sample(i,j+1),0);triangle(sample(i+1,j),sample(i+1,j+1),sample(i,j+1),0);}
   const center={start:[0,0,0],end:[.13,-.17,-1.8]};for(let i=0;i<S;i++)triangle(sample(i,R),sample(i+1,R),center,0);
  }
  top.loop=loop;
 }
 top.words.forEach((word,f)=>word.forEach((edge,e)=>{
  const at=t=>{if(index===0){return {start:mix(flat[f][e],flat[f][(e+1)%word.length],t),end:top.loop(edge.label,edge.sign===1?t:1-t)};}const weights=Array(word.length).fill(0);weights[e]=1-t;weights[(e+1)%word.length]=t;return vertex(f,weights);};
  const segments=48;for(let i=0;i<segments;i++)lines.push({v:[at(i/segments),at((i+1)/segments)],label:edge.label,face:f});
  labels.push({point:at(.5),forward:at(.5+.055*edge.sign),back:at(.5-.055*edge.sign),text:edge.label+(edge.sign===-1?'⁻¹':''),label:edge.label,face:f});
 }));
 const grid=[];
 if(index===5){const at=(u,v)=>vertex(0,[(1-u)*(1-v),u*(1-v),u*v,(1-u)*v]);
  for(let i=0;i<12;i++)for(let j=0;j<160;j++)grid.push({v:[at(i/12,j/160),at(i/12,(j+1)/160)]});
  for(let j=0;j<32;j++)for(let i=0;i<64;i++)grid.push({v:[at(i/64,j/32),at((i+1)/64,j/32)]});
 }
 return {data,top,mesh,lines,labels,flat,grid};
}
const api={cases,topology,build,squarePoint,kleinPoint,deformSpace,bottleProfile};if(typeof module!=='undefined')module.exports=api;else root.ExerciseModels=api;
})(typeof globalThis!=='undefined'?globalThis:this);
