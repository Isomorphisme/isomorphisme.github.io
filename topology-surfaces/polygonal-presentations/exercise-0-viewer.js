'use strict';
const $=id=>document.getElementById(id),canvas=$('surface'),overlay=$('overlay'),ctx=overlay.getContext('2d'),diagram=$('diagram'),dc=diagram.getContext('2d');
const gl=canvas.getContext('webgl',{antialias:true,alpha:true});
let model,index=0,progress=0,playing=false,last=0,yaw=-.25,pitch=.48,zoom=1,drag=null,width=0,height=0;
const colors=['#b74d30','#226eaa','#8660a9','#ae821c','#147e72','#b34c81','#4c719c','#7b7925','#92533e','#617f46','#6a57a4','#16829c','#aa6638','#9a4e67','#4e7770'];
const color=label=>colors[(label.charCodeAt(0)-97)%colors.length],clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),ease=t=>t*t*(3-2*t),lerp=(a,b,t)=>a.map((x,i)=>x*(1-t)+b[i]*t);
let program,buffer,positionLoc,colorLoc,matrixLoc,alphaLoc;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function setup(){if(!gl){$('error').style.display='block';$('error').textContent='This browser could not create a WebGL canvas. Open this page in a modern browser with hardware graphics enabled.';return;}
 program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec3 c;uniform mat4 m;varying vec3 color;void main(){gl_Position=m*vec4(p,1.0);color=c;}'));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 color;uniform float alpha;void main(){gl_FragColor=vec4(color,alpha);}'));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Could not initialise the surface renderer.');gl.useProgram(program);positionLoc=gl.getAttribLocation(program,'p');colorLoc=gl.getAttribLocation(program,'c');matrixLoc=gl.getUniformLocation(program,'m');alphaLoc=gl.getUniformLocation(program,'alpha');buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(positionLoc);gl.enableVertexAttribArray(colorLoc);gl.vertexAttribPointer(positionLoc,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(colorLoc,3,gl.FLOAT,false,24,12);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
function position(v){let p;
 if(v.genus)p=model.position(v,progress);
 else if(v.kleinUV)p=ExerciseModels.kleinPoint(v.kleinUV[0],v.kleinUV[1],progress);
 else if(v.uv)p=ExerciseModels.squarePoint(v.uv[0],v.uv[1],progress);
 else if(v.middle)p=progress<=.7?lerp(v.start,v.middle,ease(progress/.7)):lerp(v.middle,v.end,ease((progress-.7)/.3));
 else{p=lerp(v.start,v.end,ease(progress));p[2]+=.55*Math.sin(Math.PI*progress)*Math.sin(1.25*v.start[0]+.7*v.start[1]);}
 return ExerciseModels.deformSpace(p,progress,index);
}
function rotate(p){const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return [x,p[1]*Math.cos(pitch)-z*Math.sin(pitch),p[1]*Math.sin(pitch)+z*Math.cos(pitch)];}
function render(){if(!model)return;
 const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(w!==width||h!==height){width=w;height=h;for(const c of [canvas,overlay]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);}
 const startSpan=index===3?8.1:index===2?4.3:4.6;
 const span=index===4?(progress<.18?6+7*ease(progress/.18):progress<.76?13:13-4*ease((progress-.76)/.24)):startSpan*(1-ease(progress))+4.6*ease(progress),scale=Math.min(w/span,h/(index===4?7.5:index===5?5.5:4.8))*zoom;
 const project=v=>{const p=rotate(position(v));return [w/2+p[0]*scale,h/2-p[1]*scale,p[2]];};
 ctx.clearRect(0,0,w,h);
 const selected=$('edge').value,transparent=Boolean($('transparent')?.checked);
 if(gl){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch),sx=2*scale/w,ys=2*scale/h;
  gl.uniformMatrix4fv(matrixLoc,false,new Float32Array([cy*sx,sy*sp*ys,sy*cp/12,0,0,cp*ys,-sp/12,0,sy*sx,-cy*sp*ys,-cy*cp/12,0,0,0,0,1]));
  const vertices=[];
  const triangles=model.mesh.map(tri=>{const p=tri.v.map(position);return {tri,p,depth:transparent?p.reduce((s,v)=>s+rotate(v)[2],0):0};});
  if(transparent)triangles.sort((a,b)=>a.depth-b.depth);
  for(const {tri,p} of triangles){const u=p[1].map((x,i)=>x-p[0][i]),v=p[2].map((x,i)=>x-p[0][i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n)||1,light=.60+.4*Math.abs((n[0]*.3+n[1]*.4+n[2]*.86)/len),base=rgb(tri.color).map(x=>x*light);for(const q of p)vertices.push(...q,...base);}
  gl.uniform1f(alphaLoc,transparent?.48:1);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);
  if(transparent){gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,vertices.length/6);
  if(transparent){gl.depthMask(true);gl.colorMask(false,false,false,false);gl.drawArrays(gl.TRIANGLES,0,vertices.length/6);gl.colorMask(true,true,true,true);gl.disable(gl.BLEND);}
  gl.disable(gl.POLYGON_OFFSET_FILL);gl.uniform1f(alphaLoc,1);
  if(model.grid?.length&&$('surface-grid')?.checked){const wire=[];for(const line of model.grid)for(const v of line.v)wire.push(...position(v),.18,.32,.26);
   gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(alphaLoc,transparent?.16:.24);gl.depthMask(false);if(transparent)gl.disable(gl.DEPTH_TEST);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(wire),gl.DYNAMIC_DRAW);gl.drawArrays(gl.LINES,0,wire.length/6);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(alphaLoc,1);
  }
  if($('seams').checked){const lines=[];for(const line of model.lines){let c=rgb(color(line.label));if(selected&&selected!==line.label)c=c.map(x=>x*.3+.5);for(const v of line.v)lines.push(...position(v),...c);}if($('xray').checked)gl.disable(gl.DEPTH_TEST);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(lines),gl.DYNAMIC_DRAW);gl.drawArrays(gl.LINES,0,lines.length/6);gl.enable(gl.DEPTH_TEST);}
 }
 // Labels deliberately stay legible over the mesh; only the seams use depth occlusion.
 if($('labels').checked||(index===4&&selected)){ctx.font='600 13px system-ui';ctx.textAlign='center';for(const label of model.labels){if(selected&&selected!==label.label)continue;const p=project(label.point),a=project(label.back),b=project(label.forward),dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<2)continue;const nx=-dy/length,ny=dx/length;ctx.strokeStyle=color(label.label);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(b[0]-dx/length*7+nx*4,b[1]-dy/length*7+ny*4);ctx.moveTo(b[0],b[1]);ctx.lineTo(b[0]-dx/length*7-nx*4,b[1]-dy/length*7-ny*4);ctx.stroke();const tx=p[0]+nx*15,ty=p[1]+ny*15;ctx.lineWidth=4;ctx.strokeStyle='#f5f4ee';ctx.strokeText(label.text,tx,ty);ctx.fillStyle=color(label.label);ctx.fillText(label.text,tx,ty);}}
 drawDiagram();
}
function drawDiagram(){const w=diagram.clientWidth,h=diagram.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(diagram.width!==Math.round(w*dpr)||diagram.height!==Math.round(h*dpr)){diagram.width=Math.round(w*dpr);diagram.height=Math.round(h*dpr);}dc.setTransform(dpr,0,0,dpr,0,0);dc.clearRect(0,0,w,h);const flat=model.flat,all=flat.flat(),minX=Math.min(...all.map(p=>p[0])),maxX=Math.max(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),maxY=Math.max(...all.map(p=>p[1])),s=Math.min((w-46)/(maxX-minX),(h-45)/(maxY-minY));const map=p=>[w/2+(p[0]-(minX+maxX)/2)*s,h/2-(p[1]-(minY+maxY)/2)*s];dc.font=index===3?'11px system-ui':'13px system-ui';dc.textAlign='center';
 flat.forEach((face,f)=>{const points=face.map(map);dc.beginPath();points.forEach((p,i)=>i?dc.lineTo(...p):dc.moveTo(...p));dc.closePath();dc.fillStyle='#dce6d5';dc.fill();face.forEach((_,e)=>{const edge=model.top.words[f][e],a=points[e],b=points[(e+1)%face.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=dy/len,ny=-dx/len,selected=$('edge').value;dc.globalAlpha=selected&&selected!==edge.label?.25:1;dc.strokeStyle=color(edge.label);dc.fillStyle=color(edge.label);dc.lineWidth=2;dc.beginPath();dc.moveTo(...a);dc.lineTo(...b);const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,ux=dx/len*edge.sign,uy=dy/len*edge.sign;dc.moveTo(mx+ux*4,my+uy*4);dc.lineTo(mx-ux*3+uy*3,my-uy*3-ux*3);dc.moveTo(mx+ux*4,my+uy*4);dc.lineTo(mx-ux*3-uy*3,my-uy*3+ux*3);dc.stroke();dc.fillText(edge.label+(edge.sign<0?'⁻¹':''),mx+nx*11,my+ny*11+4);dc.globalAlpha=1;});
 const center=points.reduce((a,p)=>[a[0]+p[0]/points.length,a[1]+p[1]/points.length],[0,0]);
 if(index===4){dc.save();dc.setLineDash([5,4]);dc.strokeStyle=color('e');dc.lineWidth=2;dc.beginPath();dc.moveTo(...points[0]);dc.lineTo(...points[4]);dc.stroke();dc.setLineDash([]);dc.fillStyle=color('e');dc.fillText('e (cut)',center[0]+25,center[1]);dc.restore();}
 dc.font='600 10px system-ui';points.forEach((p,i)=>{const dx=p[0]-center[0],dy=p[1]-center[1],len=Math.hypot(dx,dy)||1,x=p[0]+dx/len*10,y=p[1]+dy/len*10;dc.beginPath();dc.arc(x,y,7,0,Math.PI*2);dc.fillStyle='#294b3c';dc.fill();dc.fillStyle='#ffffff';dc.fillText(String(model.top.vertices[f][i]+1),x,y+3.5);});
 dc.font=index===3?'11px system-ui':'13px system-ui';if(flat.length>1){dc.fillStyle='#526457';dc.fillText(`F${f+1}`,center[0],center[1]+4);}
 });
}
function setPlaying(value){playing=value;$('play').textContent=value?'Ⅱ Pause':'▶ Play';}
function update(){ $('timeline').value=Math.round(progress*1000);$('badge').textContent=progress===0?'The original faces':progress===1?'All prescribed edges identified':index===5?(progress===.5?'The cylinder':progress<.5?'Gluing the b edges':progress<.62?'Widen the body and raise the neck':progress<.9?'Bend the neck through the side':'The bottle-shaped Klein surface'):index===6?(progress===.5?'The cylinder':progress<.5?'Gluing the a edges':'Gluing the b circles'):index===2&&progress>=.7?'Rounding the tetrahedron':'Moving & bending the faces';$('phase').textContent=progress===0?'Each face is a disc. Equal letters indicate the pair to glue.':index===5&&progress<1?(progress<.5?'Roll the square to match the two b edges with their arrows aligned.':progress===.5?'The b edges now form one seam. The two a edges have become the boundary circles of a cylinder.':progress<.62?'Stretch and widen the cylinder to make the bottle body and a long, narrower neck. The b seam stays glued.':'Bend the neck back through the side of the bottle, then join the two a circles with reversed directions. The side crossing is not an extra gluing.'):index===6&&progress<1?(progress<.5?'Bring the two a edges together with their arrows aligned.':progress===.5?'The a edges form one seam. The two b circles are still boundary; next, join them without a twist.':'Bend the cylinder and match the b circles without a twist.'):progress===1?'All edge pairs now coincide with their arrows aligned. The quotient has no boundary.':index===2&&progress>=.7?'The four faces have closed into a tetrahedron. Radial rounding now turns its boundary into a round sphere.':'The faces stretch and bend in three dimensions. Matching edges move towards their common seam.';if(index===4){
 const stages=[
  [0,'The standard octagon','Cut along the diagonal e. Its two copies will remain open throughout the cylinder and torus stages.'],
  [.001,'Cut along e','Move the two pentagons apart. The new e edges remain open.'],
  [.18,'Roll into cylinders','Glue a on the left and c on the right by rolling each piece into a cylinder. Keep the small e openings unglued.'],
  [.40,'Two cylinders','The a pair is glued on the left and the c pair on the right. The b and d sides are the end circles. Each cylinder also keeps the small e opening in its side.'],
  [.46,'Bend the cylinders','Keep a and c glued. Bend each cylinder to bring its end circles together: identify b on the left and d on the right. The e openings stay open.'],
  [.68,'Two punctured tori','The b and d end circles are now identified. Each piece is a torus with one disc removed; the two green e circles are still separate boundary components.'],
  [.76,'Glue the boundary circles','Bring the two green e circles together and identify corresponding points to make the connecting neck.'],
  [1,'Genus 2 · Connected sum','No boundary remains. The connected sum T² # T² has χ = −1 + (−1) = −2.']
 ];let stage=stages[0];for(const candidate of stages)if(progress>=candidate[0])stage=candidate;$('badge').textContent=stage[1];$('phase').textContent=stage[2];
 }document.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('active',Math.abs(progress-Number(b.dataset.t))<.002));render();}
function choose(i){index=i;model=ExerciseModels.build(i);progress=0;setPlaying(false);yaw=-.25;pitch=.48;zoom=1;const d=model.data;document.querySelectorAll('[data-case]').forEach(b=>{const active=Number(b.dataset.case)===i;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$('kind').textContent=`${d.explanation?'STANDARD PRESENTATION':'PRESENTATION ('+d.key+')'} · ${d.orientable?'ORIENTABLE':'NONORIENTABLE'}`;$('name').textContent=d.name;$('surface-name').textContent=d.surface;$('description').textContent=d.description;for(const k of ['v','e','f','chi'])$(k).textContent=d[k==='chi'?k:k.toUpperCase()];$('calculation').textContent=`χ = V − E + F = ${d.V} − ${d.E} + ${d.F} = ${d.chi}`;const explanations=[
 {reason:'The edge a occurs twice with the same orientation, so the surface is not orientable.',equation:'We have −1 = χ(Nₖ) = 2 − k, hence k = 3.',result:'This presents the non-orientable surface N₃ = ℝP² # ℝP² # ℝP².'},
 {reason:'Each edge occurs once in each orientation, so the surface is orientable.',equation:'We have 0 = χ(Σ<sub>g</sub>) = 2 − 2g, hence g = 1.',result:'This presents the orientable surface Σ<sub>1</sub> = T², the torus.'},
 {reason:'These four triangular faces form the boundary of a tetrahedron.',equation:'We have 2 = χ(Σ<sub>g</sub>) = 2 − 2g, hence g = 0.',result:'This presents the orientable surface Σ<sub>0</sub> = S², the sphere.'},
 {reason:'An orientable surface has even χ so this surface is not orientable.',equation:'We have 1 = χ(Nₖ) = 2 − k, hence k = 1.',result:'This presents the non-orientable surface N₁ = ℝP², the real projective plane.'}
 ];const explanation=d.explanation||explanations[i];$('orientation-title').textContent=d.orientable?'Orientable':'Non-orientable';$('orientation-reason').textContent=explanation.reason;$('parameter-title').textContent=d.orientable?'Genus':'Crosscaps';$('classification').innerHTML=explanation.equation;$('classification-result').innerHTML=explanation.result;

 $('words').replaceChildren();
 const appendText=text=>$('words').append(document.createTextNode(text));
 const appendLetter=(parent,token)=>{const letter=document.createElement('span');letter.textContent=token.replace('-','⁻¹');letter.style.color=color(token[0]);parent.append(letter);};
 appendText('⟨');Object.keys(model.top.edges).forEach((label,j)=>{if(j)appendText(', ');appendLetter($('words'),label);});appendText(' | ');
 d.words.forEach((word,f)=>{if(f)appendText(', ');const face=document.createElement('span');face.className='face';word.split(' ').forEach(token=>appendLetter(face,token));$('words').append(face);});appendText('⟩');
 $('edge').replaceChildren(new Option('All edge pairs',''));Object.keys(model.top.edges).forEach(label=>$('edge').add(new Option(label,label)));$('pair-info').textContent='Arrowheads match arrowheads.';

 if(index===5){yaw=-.45;pitch=.12;}
 if(index===4){$('edge').add(new Option('e · cut boundary','e'));$('labels').checked=false;pitch=.72;}
 update();}
$('play').onclick=()=>{if(progress===1)progress=0;setPlaying(!playing);update();};$('reset').onclick=()=>{setPlaying(false);progress=0;update();};$('view').onclick=()=>{yaw=index===5?-.45:-.25;pitch=index===4?.72:index===5?.12:.48;zoom=1;render();};$('timeline').oninput=e=>{setPlaying(false);progress=Number(e.target.value)/1000;update();};document.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.case)));document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{setPlaying(false);progress=Number(b.dataset.t);update();});
for(const id of ['seams','labels','xray','transparent','surface-grid'])if($(id))$(id).onchange=render;
$('edge').onchange=()=>{const selected=$('edge').value;$('pair-info').textContent=selected==='e'?'The two cut boundaries are identified in the last step.':selected?model.top.edges[selected].map(p=>`F${p.f+1}, side ${p.i+1}`).join(' ↔ '):'Arrowheads match arrowheads.';render();};
overlay.onpointerdown=e=>{drag=[e.clientX,e.clientY];overlay.setPointerCapture(e.pointerId);};overlay.onpointermove=e=>{if(!drag)return;yaw+=(e.clientX-drag[0])*.009;pitch=clamp(pitch+(e.clientY-drag[1])*.009,-1.5,1.5);drag=[e.clientX,e.clientY];render();};overlay.onpointerup=overlay.onpointercancel=()=>drag=null;overlay.addEventListener('wheel',e=>{e.preventDefault();zoom=clamp(zoom*Math.exp(-e.deltaY*.001),.55,1.9);render();},{passive:false});window.addEventListener('resize',render);
document.addEventListener('visibilitychange',()=>{last=performance.now();});
function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;if(playing){progress=Math.min(1,progress+dt*Number($('speed').value)/(index===4?32:index===5?22:18));if(progress===1)setPlaying(false);update();}requestAnimationFrame(frame);}
setup();choose(Number(document.body.dataset.model||0));requestAnimationFrame(frame);
