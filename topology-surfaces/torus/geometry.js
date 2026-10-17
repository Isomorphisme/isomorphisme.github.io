(function(root){
'use strict';
const TAU=2*Math.PI,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const torus=(x,y)=>{const a=TAU*x,b=TAU*y;return [(2+Math.cos(b))*Math.cos(a),Math.sin(b),(2+Math.cos(b))*Math.sin(a)];};
const fractional=x=>((x%1)+1)%1;
function squarePartners(x,y){const xs=x===0||x===1?[0,1]:[x],ys=y===0||y===1?[0,1]:[y];return xs.flatMap(a=>ys.map(b=>[a,b]));}
const api={TAU,clamp,torus,fractional,squarePartners};if(typeof module!=='undefined')module.exports=api;else root.TopologyVis=api;
})(typeof globalThis!=='undefined'?globalThis:this);
