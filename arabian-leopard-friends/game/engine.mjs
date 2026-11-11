export const PHYSICS = Object.freeze({ gravity: 1500, jump: 655, doubleJump: 610, walk: 305, run: 460, acceleration: 1900, friction: 2250, width: 65, height: 56, ground: 555 });
const ground=(x,w)=>({x,y:555,w,h:220,solid:true});
const ledge=(x,y,w,extra={})=>({x,y,w,h:56,...extra});
const star=(x,y)=>({x,y,type:'star'});
const leaf=(x,y)=>({x,y,type:'leaf'});
export const LEVELS=[
 {name:'وادي الصخور',subtitle:'اقفز، واستكشف، واجمع ٣ شارات طبيعة.',width:3600,theme:'dawn',required:3,goal:{x:3430,y:555},checkpoint:{x:1950,y:555},
 platforms:[ground(0,840),ground(980,730),ground(1840,900),ground(2890,710),ledge(370,430,240),ledge(1150,430,210),ledge(1450,330,185),ledge(2040,425,230),ledge(2390,325,185),ledge(3000,425,225)],
 pickups:[leaf(490,392),leaf(1260,392),leaf(1650,510),leaf(2150,387),leaf(3110,387),star(270,510),star(675,510),star(1040,510),star(1540,292),star(1630,465),star(2040,505),star(2480,287),star(2680,510),star(2950,510),star(3290,510)],wind:[]},
 {name:'ممرّ القمم',subtitle:'قفزة ثانية تساعدك على بلوغ المنصّات العالية.',width:4400,theme:'cliffs',required:3,goal:{x:4230,y:555},checkpoint:{x:1950,y:555},
 platforms:[ground(0,730),ground(900,760),ground(1850,750),ground(2770,700),ground(3650,750),ledge(300,425,220),ledge(1020,430,190,{moveX:55,speed:1.1}),ledge(1290,330,190),ledge(1990,420,230),ledge(2300,315,180),ledge(2860,410,230,{moveY:28,speed:1.4}),ledge(3210,300,190),ledge(3800,425,230)],
 pickups:[leaf(410,387),leaf(1385,292),leaf(2100,382),leaf(2990,350),leaf(3910,387),star(240,510),star(595,510),star(960,510),star(1200,390),star(1550,510),star(2390,277),star(2490,510),star(3300,262),star(3720,510),star(4080,510)],wind:[]},
 {name:'ممر الرياح',subtitle:'وازن قفزاتك مع الرياح واجمع أربع شارات.',width:5000,theme:'sunset',required:4,goal:{x:4810,y:555},checkpoint:{x:2950,y:555},
 platforms:[ground(0,740),ground(940,730),ground(1880,760),ground(2860,790),ground(3880,1120),ledge(305,425,240),ledge(1080,425,195,{moveX:50,speed:1.15}),ledge(1330,330,190),ledge(2050,420,235),ledge(2400,310,190),ledge(3060,405,220,{moveY:30,speed:1.5}),ledge(3360,300,190),ledge(4300,410,245)],
 pickups:[leaf(425,387),leaf(1415,292),leaf(2170,382),leaf(3180,345),leaf(4420,372),star(245,510),star(620,510),star(1005,510),star(1240,380),star(1590,510),star(2480,272),star(2600,495),star(3450,262),star(3980,510),star(4620,510)],wind:[{x:2750,w:850,strength:-170}]}
];
// Five finite levels: each introduces a skill before combining it.
LEVELS.unshift({name:'خطوات نمور',subtitle:'تعلّم الحركة والقفز واجمع شارتين.',width:2600,theme:'dawn',required:2,goal:{x:2450,y:555},checkpoint:{x:1350,y:555},
 platforms:[ground(0,1100),ground(1200,650),ground(1950,650),ledge(360,440,270),ledge(1400,425,240),ledge(2070,405,240)],
 pickups:[leaf(490,402),leaf(900,510),leaf(1520,387),leaf(2170,367),star(220,510),star(720,510),star(1280,510),star(1800,510),star(2340,510)],wind:[]});
LEVELS[3].required=4;
LEVELS.push({name:'طريق العودة',subtitle:'اجمع مهاراتك واعبر إلى المأوى الأخير.',width:5600,theme:'sunset',required:4,goal:{x:5420,y:555},checkpoint:{x:3040,y:555},
 platforms:[ground(0,670),ground(890,600),ground(1730,670),ground(2660,660),ground(3570,720),ground(4550,1050),ledge(320,415,200),ledge(1030,420,180,{moveX:65,speed:1.3}),ledge(1360,305,175),ledge(1930,405,195,{moveY:35,speed:1.5}),ledge(2250,285,175),ledge(2820,410,190),ledge(3170,300,180,{moveX:55,speed:1.4}),ledge(3750,390,190,{moveY:35,speed:1.6}),ledge(4090,285,170),ledge(4790,405,200)],
 pickups:[leaf(420,377),leaf(1440,267),leaf(2030,340),leaf(2915,372),leaf(3850,325),leaf(4890,367),star(180,510),star(1150,380),star(1830,510),star(2335,247),star(2750,510),star(3260,262),star(3700,510),star(4175,247),star(4640,510),star(5200,510)],wind:[{x:1600,w:850,strength:-160},{x:3500,w:750,strength:-200}]});
export const TOTAL_LEVELS=LEVELS.length;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const approach=(value,target,delta)=>value<target?Math.min(value+delta,target):Math.max(value-delta,target);
export class GameWorld{
 constructor(){this.results=Array(LEVELS.length).fill(null);this.events=[];this.load(0);this.status='ready';}
 load(index){
  if(!Number.isInteger(index)||index<0||index>=LEVELS.length)throw new RangeError('Unknown level');
  this.levelIndex=index;this.level=LEVELS[index];this.time=0;this.events=[];this.jumpBuffer=0;this.respawnTimer=0;this.goalHint=0;this.checkpointReached=false;this.collected=new Set();this.attempts=0;
  this.platforms=this.level.platforms.map((p,i)=>({...p,id:i,baseX:p.x,baseY:p.y,dx:0,dy:0}));
  this.spawn={x:90,y:PHYSICS.ground-PHYSICS.height};
  this.player={...this.spawn,w:PHYSICS.width,h:PHYSICS.height,vx:0,vy:0,grounded:true,facing:1,jumps:0,coyote:.12,onPlatform:0,invincible:0,animation:0};
  this.status='playing';this.camera=0;this.results[index]=null;
 }
 start(){this.results=Array(LEVELS.length).fill(null);this.load(0);return this.snapshot();}
 restart(){this.load(this.levelIndex);return this.snapshot();}
 next(){if(this.status!=='complete'||this.levelIndex>=LEVELS.length-1)return false;this.load(this.levelIndex+1);return true;}
 pause(){if(this.status!=='playing')return false;this.status='paused';return true;}
 resume(){if(this.status!=='paused')return false;this.status='playing';return true;}
 queueJump(){if(this.status==='playing'&&this.respawnTimer<=0)this.jumpBuffer=.16;}
 counts(){let leaves=0,stars=0;for(const i of this.collected){if(this.level.pickups[i].type==='leaf')leaves++;else stars++;}return {leaves,stars};}
 snapshot(){const counts=this.counts();return {status:this.status,level:this.levelIndex+1,totalLevels:LEVELS.length,attempts:this.attempts,levelName:this.level.name,x:Math.round(this.player.x),y:Math.round(this.player.y),...counts,requiredLeaves:this.level.required,checkpoint:this.checkpointReached,totalStars:this.results.reduce((sum,r,i)=>sum+(i===this.levelIndex?counts.stars:r?.stars||0),0),totalLeaves:this.results.reduce((sum,r,i)=>sum+(i===this.levelIndex?counts.leaves:r?.leaves||0),0)};}
 drainEvents(){const events=this.events;this.events=[];return events;}
 recover(){if(this.status!=='playing'&&this.status!=='paused')return false;this.respawnTimer=0;this.jumpBuffer=0;Object.assign(this.player,this.spawn,{vx:0,vy:0,grounded:false,jumps:0,coyote:.12,onPlatform:null,invincible:1.4});this.events.push({type:'recovered'});return true;}
 respawn(){this.attempts++;this.respawnTimer=.5;this.player.vx=0;this.player.vy=0;this.jumpBuffer=0;this.events.push({type:'fall'});}
 step(dt,input={}){
  if(this.status!=='playing')return;
  if(!Number.isFinite(dt)||dt<=0)return;
  dt=clamp(dt,0,1/30);this.time+=dt;this.goalHint=Math.max(0,this.goalHint-dt);
  const p=this.player;
  if(![p.x,p.y,p.vx,p.vy].every(Number.isFinite)){this.recover();return;}
  if(this.respawnTimer>0){this.respawnTimer=Math.max(0,this.respawnTimer-dt);if(this.respawnTimer===0){Object.assign(p,this.spawn,{vx:0,vy:0,grounded:false,jumps:0,coyote:.12,onPlatform:null,invincible:1.4});this.events.push({type:'respawn'});}return;}
  for(const platform of this.platforms){const px=platform.x,py=platform.y;platform.x=platform.baseX+(platform.moveX?Math.sin(this.time*(platform.speed||1))*platform.moveX:0);platform.y=platform.baseY+(platform.moveY?Math.sin(this.time*(platform.speed||1))*platform.moveY:0);platform.dx=platform.x-px;platform.dy=platform.y-py;}
  if(p.grounded&&p.onPlatform!==null){const support=this.platforms[p.onPlatform];if(support){p.x+=support.dx;p.y+=support.dy;}else{p.grounded=false;p.onPlatform=null;}}
  p.invincible=Math.max(0,p.invincible-dt);p.coyote=p.grounded?.12:Math.max(0,p.coyote-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);
  const direction=Number(!!input.right)-Number(!!input.left),speed=input.run?PHYSICS.run:PHYSICS.walk;
  p.vx=approach(p.vx,direction*speed,(direction?PHYSICS.acceleration:PHYSICS.friction)*dt);
  if(direction)p.facing=direction;
  for(const wind of this.level.wind){if(p.x>wind.x&&p.x<wind.x+wind.w&&!p.grounded)p.vx+=wind.strength*dt;}
  if(this.jumpBuffer>0&&(p.coyote>0||p.jumps<2)){
   const grounded=p.coyote>0;p.vy=-(grounded?PHYSICS.jump:PHYSICS.doubleJump);p.jumps=grounded?1:Math.max(1,p.jumps)+1;p.grounded=false;p.coyote=0;p.onPlatform=null;this.jumpBuffer=0;this.events.push({type:grounded?'jump':'doubleJump',x:p.x+p.w/2,y:p.y+p.h});
  }
  const oldX=p.x;p.x=clamp(p.x+p.vx*dt,0,this.level.width-p.w);
  for(const platform of this.platforms){if(!platform.solid||p.y+p.h<=platform.y+4||p.y>=platform.y+platform.h)continue;if(p.x+p.w>platform.x&&p.x<platform.x+platform.w){if(oldX+p.w<=platform.x+2){p.x=platform.x-p.w;p.vx=0;}else if(oldX>=platform.x+platform.w-2){p.x=platform.x+platform.w;p.vx=0;}}}
  const oldBottom=p.y+p.h;const wasGrounded=p.grounded;p.vy=Math.min(1100,p.vy+PHYSICS.gravity*dt);p.y+=p.vy*dt;p.grounded=false;p.onPlatform=null;
  let landing=null;
  if(p.vy>=0){for(const platform of this.platforms){if(p.x+p.w>platform.x+2&&p.x<platform.x+platform.w-2&&oldBottom<=platform.y+Math.max(5,platform.dy+5)&&p.y+p.h>=platform.y){if(!landing||platform.y<landing.y)landing=platform;}}}
  if(landing){if(!wasGrounded&&p.vy>260)this.events.push({type:'land',x:p.x+p.w/2,y:landing.y});p.y=landing.y-p.h;p.vy=0;p.grounded=true;p.jumps=0;p.coyote=.12;p.onPlatform=landing.id;}
  p.animation+=dt*(Math.abs(p.vx)>20?Math.abs(p.vx)/29:3);
  for(let i=0;i<this.level.pickups.length;i++){if(this.collected.has(i))continue;const item=this.level.pickups[i];const nx=clamp(item.x,p.x-12,p.x+p.w+12),ny=clamp(item.y,p.y-12,p.y+p.h+12);if(Math.hypot(item.x-nx,item.y-ny)<25){this.collected.add(i);this.events.push({type:item.type,x:item.x,y:item.y});}}
  const cp=this.level.checkpoint;
  if(!this.checkpointReached&&Math.abs(p.x+p.w/2-cp.x)<95&&p.y+p.h<=cp.y+12&&p.y+p.h>=cp.y-300){this.checkpointReached=true;this.spawn={x:cp.x-30,y:cp.y-p.h};this.events.push({type:'checkpoint',x:cp.x,y:cp.y-70});}
  const goal=this.level.goal;
  if(Math.abs(p.x+p.w/2-goal.x)<85&&p.grounded&&p.y+p.h>goal.y-30){const counts=this.counts();if(counts.leaves>=this.level.required){this.status='complete';this.results[this.levelIndex]=counts;this.events.push({type:'complete',...counts});}else if(!this.goalHint){this.goalHint=4;const missing=this.level.pickups.filter((it,i)=>it.type==='leaf'&&!this.collected.has(i));const nearest=missing.sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];this.events.push({type:'needLeaves',remaining:this.level.required-counts.leaves,direction:nearest&&nearest.x<p.x?'left':'right'});}}
  if(p.y>760)this.respawn();
 }
 followCamera(viewWidth,dt){const target=clamp(this.player.x+this.player.w/2-viewWidth*.37+this.player.vx*.18,0,Math.max(0,this.level.width-viewWidth));this.camera+=(target-this.camera)*(1-Math.exp(-dt*5));return this.camera;}
}
