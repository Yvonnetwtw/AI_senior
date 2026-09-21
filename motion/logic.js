/* Pure teaching logic. Angles use aspect-corrected image coordinates. */
const MotionLogic=(()=>{
 function angle(a,b,c){const u={x:a.x-b.x,y:a.y-b.y},v={x:c.x-b.x,y:c.y-b.y};const den=Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y);return den?Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/den)))*180/Math.PI:null;}
 class Counter{
  constructor(p){this.p=p;this.count=0;this.reset();}
  reset(){this.phase='need-down';this.since=null;this.values=[];}
  update(value,t){if(value===null||!Number.isFinite(value)){this.reset();return false;}this.values.push(value);if(this.values.length>this.p.smooth)this.values.shift();this.angle=this.values.reduce((a,b)=>a+b,0)/this.values.length;const condition=this.phase==='ready'?this.angle>=this.p.up:this.angle<=this.p.down;if(!condition){this.since=null;return false;}if(this.since===null)this.since=t;if(t-this.since<this.p.hold)return false;this.since=null;if(this.phase==='need-down'){this.phase='ready';return false;}if(this.phase==='ready'){this.phase='raised';return false;}this.count++;this.phase='ready';return true;}
 }
 class Stillness{
  constructor(p){this.p=p;this.reset();}
  reset(){this.anchor=null;this.start=null;this.pending=null;this.fired=false;this.elapsed=0;}
  cancel(t,points){this.reset();this.anchor=points;this.start=t;}
  update(points,scale,t){if(!points||scale<.03){this.reset();return {state:'lost'};}if(!this.anchor){this.anchor=points;this.start=t;}const motion=Math.max(...points.map((p,i)=>Math.hypot(p.x-this.anchor[i].x,p.y-this.anchor[i].y)))/scale;if(motion>this.p.motion){this.cancel(t,points);return {state:'moving'};}this.elapsed=(t-this.start)/1000;if(this.pending!==null){const left=Math.max(0,this.p.cancel-(t-this.pending)/1000);if(left<=0&&!this.fired){this.fired=true;return {state:'event',left:0};}return {state:this.fired?'reminded':'pending',left};}if(this.elapsed>=this.p.seconds){this.pending=t;return {state:'pending',left:this.p.cancel};}return {state:'waiting'};}
 }
 // Educational video heuristic, not a clinically validated fall detector.
 class Fall{
  constructor(){this.reset();}
  reset(){this.history=[];this.since=null;this.latched=false;this.descentUntil=-1;}
  update(center,tilt,t){if(!center){this.reset();return false;}this.history=this.history.filter(x=>t-x.t<=800);const descent=this.history.some(x=>center.y-x.y>.12);this.history.push({t,y:center.y});if(descent)this.descentUntil=t+1600;if(tilt>60&&t<=this.descentUntil){if(this.since===null)this.since=t;if(t-this.since>=700&&!this.latched){this.latched=true;return true;}}else this.since=null;if(tilt<35)this.latched=false;return false;}
 }
 return {angle,Counter,Stillness,Fall};
})();
if(typeof module!=='undefined')module.exports=MotionLogic;
