'use strict';
game.import('play',function(lib,game,ui,get,ai,_status){
	return {
		name:'coin',
		init:function(){
			if(lib.config.mode!='chess'||get.config('chess_mode')!='leader'){
				_status.coin=0;
			}
		},
		arenaReady:function(){
			if(_status.video||_status.connectMode) return;
			if(lib.config.mode!='chess'||get.config('chess_mode')!='leader'){
				var str;
				if(lib.config.coin_display_playpackconfig=='text'){
					str='<span>'+lib.config.coin+'</span><span>金</span>'
				}
				else{
					str='<span style="position:absolute">㉤</span><span style="margin-left:18px;font-family:xinwei;line-height:10px">'+lib.config.coin+'</span>';
				}
				if(lib.config.coin_canvas_playpackconfig){
					ui.window.classList.add('canvas_top');
				}
				ui.coin=ui.create.system(str,null,true);
				if(lib.config.snowFall){
					game.haveFun.list.snow.bought=true;
					setTimeout(function(){
						game.haveFun.snow();
					},500);
				}
				lib.setPopped(ui.coin,function(){
					var uiintro=ui.create.dialog('hidden');
					uiintro.classList.add('coin_menu')
					uiintro.add('商店');
					uiintro.listen(function(e){
						e.stopPropagation();
					});
					var clickBuy=function(){
						if(this.innerHTML=='停止'){
							game.haveFun[this.name+'Stop']();
						}
						else if(this.innerHTML=='开始'){
							game.haveFun[this.name]();
						}
						else if(this.innerHTML.indexOf('金')!=-1){
							if(lib.config.coin>=this.content.cost){
								this.content.bought=true;
								game.changeCoin(-this.content.cost);
								game.haveFun[this.name]();
								if(this.content.onbuy){
									this.content.onbuy.call(this);
								}
							}
							else{
								return;
							}
						}
						ui.click.window();
					};
					for(var i in game.haveFun.list){
						var item=game.haveFun.list[i];
						uiintro.add('<div class="coin_buy">'+item.name+'<div class="menubutton">'+item.cost+'金</span></div></div>');
						var buy=uiintro.content.lastChild.lastChild.lastChild;
						if(lib.config.coin<item.cost&&!item.bought){
							buy.classList.add('disabled');
						}
						if(item.bought){
							if(item.running){
								buy.innerHTML='停止';
								if(item.control){
									var node=item.control();
									if(node){
										buy.parentNode.appendChild(node,buy);
									}
								}
							}
							else{
								buy.innerHTML='开始';
							}
						}
						buy.name=i;
						buy.content=item;
						buy.listen(clickBuy);
					}

					if(!game.phaseNumber&&!game.online){
						uiintro.add('下注');
						uiintro.add('<div class="coin_buy">本局获胜<div class="menubutton">20金</span></div></div>');
						var bet=uiintro.content.lastChild.lastChild.lastChild;
						bet.listen(function(){
							if(_status.betWin) return;
							_status.betWin=true;
							game.changeCoin(-20);
							this.innerHTML='已下注';
						});
						if(_status.betWin){
							bet.innerHTML='已下注';
						}
					}
					else if(_status.betWin){
						uiintro.add('下注');
						uiintro.add('<div class="coin_buy">本局获胜<div class="menubutton">已下注</span></div></div>');
					}

					uiintro.classList.add('noleave');

					return uiintro;
				},220,400);
			}
		},
		game:{
			changeCoin:function(num){
				if(typeof num=='number'&&ui.coin){
					game.saveConfig('coin',lib.config.coin+num);
					var str;
					if(lib.config.coin_display_playpackconfig=='text'){
						str='<span>'+lib.config.coin+'</span><span>金</span>'
					}
					else{
						str='<span style="position:absolute">㉤</span><span style="margin-left:18px;font-family:xinwei;line-height:10px">'+lib.config.coin+'</span>';
					}
					ui.coin.innerHTML=str;
				}
			},
			haveFun:{
				list:{
					firework:{
						name:'烟花',
						cost:50,
					},
					snow:{
						name:'下雪',
						cost:20,
						size:'large',
						control:function(){
							var size=ui.create.div('.menubutton');
							if(game.haveFun.list.snow.size=='small'){
								size.innerHTML='大雪';
							}
							else{
								size.innerHTML='小雪';
							}
							size.listen(game.haveFun.snowSize);
							return size;
						}
					},
					star:{
						name:'星云',
						cost:10
					},
					blink:{
						name:'闪烁',
						cost:10
					}
				},
				alwaysSnow:function(){
					game.saveConfig('snowFall',!lib.config.snowFall);
					game.reload();
				},
				blink:function(){
					if(game.haveFun.list.blink.running) return;
					game.haveFun.list.blink.running=true;
					if(game.haveFun.blinkLoop){
						game.haveFun.blinkLoop();
					}
					else{
						var canvas = document.createElement("canvas");
						ui.window.appendChild(canvas);
						canvas.classList.add('fun');
						canvas.style.zIndex=20;
						var ctx = canvas.getContext("2d");

						//Make the canvas occupy the full page
						var W = ui.window.offsetWidth, H = ui.window.offsetHeight;
						canvas.width = W;
						canvas.height = H;
						lib.onresize.push(function(){
							var W = ui.window.offsetWidth, H = ui.window.offsetHeight;
							canvas.width = W;
							canvas.height = H;
						});

						var particles = [];
						var mouse = {};

						//Lets create some particles now
						var particle_count = 25;


						//finally some mouse tracking
						ui.window.addEventListener('mousemove', function(e)
						{
							//since the canvas = full page the position of the mouse
							//relative to the document will suffice
							mouse.x = e.pageX/game.documentZoom;
							mouse.y = e.pageY/game.documentZoom;
						});
						ui.window.addEventListener('touchmove',function(e){
							mouse.x = e.touches[0].clientX/game.documentZoom;
							mouse.y = e.touches[0].clientY/game.documentZoom;
						});

						var particle=function()
						{
							//speed, life, location, life, colors
							//speed.x range = -2.5 to 2.5
							//speed.y range = -15 to -5 to make it move upwards
							//lets change the Y speed to make it look like a flame
							this.speed = {x: -2.5+Math.random()*5, y: -5+Math.random()*10};
							this.speed.x/=4;
							this.speed.y/=4;
							//location = mouse coordinates
							//Now the flame follows the mouse coordinates
							if(mouse.x && mouse.y)
							{
								this.location = {x: mouse.x, y: mouse.y};
							}
							else
							{
								this.location = {x: W/2, y: H/2};
							}
							//radius range = 10-30
							this.radius = 10+Math.random()*20;
							//life range = 20-30
							this.radius/=4;
							this.life = 20+Math.random()*10;
							this.life*=4;
							this.remaining_life = this.life;
							//colors
							this.r = Math.round(Math.random()*255);
							this.g = Math.round(Math.random()*255);
							this.b = Math.round(Math.random()*255);
						}
						for(var i = 0; i < particle_count; i++)
						{
							particles.push(new particle());
						}

						var draw=function()
						{
							if(!game.haveFun.list.blink.running){
								canvas.width=W;
								canvas.height=H;
								return;
							}
							ctx.clearRect(0, 0, W, H);
							//Painting the canvas black
							//Time for lighting magic
							//particles are painted with "lighter"
							//In the next frame the background is painted normally without blending to the
							//previous frame
							ctx.globalCompositeOperation = "lighter";

							for(var i = 0; i < particles.length; i++)
							{
								var p = particles[i];
								ctx.beginPath();
								//changing opacity according to the life.
								//opacity goes to 0 at the end of life of a particle
								p.opacity = Math.round(p.remaining_life/p.life*100)/100
								//a gradient instead of white fill
								var gradient = ctx.createRadialGradient(p.location.x, p.location.y, 0, p.location.x, p.location.y, p.radius);
								gradient.addColorStop(0, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
								gradient.addColorStop(0.5, "rgba("+p.r+", "+p.g+", "+p.b+", "+p.opacity+")");
								gradient.addColorStop(1, "rgba("+p.r+", "+p.g+", "+p.b+", 0)");
								ctx.fillStyle = gradient;
								ctx.arc(p.location.x, p.location.y, p.radius, Math.PI*2, false);
								ctx.fill();

								//lets move the particles
								p.remaining_life--;
								p.radius-=0.2;
								p.location.x += p.speed.x;
								p.location.y += p.speed.y;

								//regenerate particles
								if(p.remaining_life < 0 || p.radius < 0)
								{
									//a brand new particle replacing the dead one
									particles[i] = new particle();
								}
							}
							requestAnimationFrame(draw);
						}

						draw();
						game.haveFun.blinkLoop=draw;
						game.haveFun.blinkStop=function(){
							game.haveFun.list.blink.running=false;
						}
					}
				},
				star:function(){
					if(game.haveFun.list.star.running) return;
					game.haveFun.list.star.running=true;
					if(game.haveFun.starLoop){
						game.haveFun.starLoop();
					}
					else{
						//******************************************************
						// Yet Another Particle Engine
						var cos = Math.cos,
							sin = Math.sin,
							sqrt = Math.sqrt,
							abs = Math.abs,
							atan2 = Math.atan2,
							log = Math.log,
							random = Math.random,
							PI = Math.PI,
							sqr = function(v){return v*v;},
							particles = [],
							drawScale = 1,
							emitters = [],
							forces  = [],
							collidedMass = 0,
							maxParticles = 100,
							emissionRate = 1,
							minParticleSize = 2;

						//-------------------------------------------------------
						// Vectors, and not the kind you put stuff in
						var Vector=function(x, y, z) {
						  this.x = x || 0;
						  this.y = y || 0;
						  this.z = z || 0;
						}
						Vector.prototype = {
						  add : function(vector) {
							this.x += vector.x;
							this.y += vector.y;
							this.z += vector.z;
							return this;
						  },
						  subtract : function(vector) {
							this.x -= vector.x;
							this.y -= vector.y;
							this.z -= vector.z;
							return this;
						  },
						  multiply : function(another) {
							this.x /= another.x;
							this.y /= another.y;
							this.z /= another.z;
							return this;
						  },
						  divide : function(another) {
							this.x /= another.x;
							this.y /= another.y;
							this.z /= another.z;
							return this;
						  },
						  scale : function(factor) {
							this.x *= factor;
							this.y *= factor;
							this.z *= factor;
							return this;
						  },
						  magnitude : function () {
							return sqrt(sqr(this.x + this.y));
						  },
						  distance : function (another) {
							return abs(sqrt(sqr(this.x - another.x) + sqr(this.y - another.y)));
						  },
						  angle : function (angle, magnitude) {
							if(angle && magnitude)
							  return Vector.fromAngle(angle, magnitude);
							return atan2(this.y, this.x);
						  },
						  clone : function() {
							return new Vector(this.x, this.y, this.z);
						  },
						  equals : function(another) {
							return this.x === another.x&&
								this.y === another.y&&
								this.z === another.z;
						  },
						  random : function(r) {
							this.x += (random() * r * 2) - r;
							this.y += (random() * r * 2) - r;
							return this;
						  }
						};
						Vector.fromAngle = function (angle, magnitude) {
						  return new Vector(
							magnitude * cos(angle),
							magnitude * sin(angle),
							magnitude * sin(angle));
						};

						//******************************************************
						// A thing with mass, position, and velocity - like your mom
						var Particle=function(pt, vc, ac, mass) {
						  this.pos = pt || new Vector(0, 0);
						  this.vc = vc || new Vector(0, 0);
						  this.ac = ac || new Vector(0, 0);
						  this.mass = mass || 1;
						  this.alive = true;
						}
						Particle.prototype.move = function () {
						  this.vc.add(this.ac);
						  this.pos.add(this.vc);
						};
						Particle.prototype.reactToForces = function (fields) {
						  var totalAccelerationX = 0;
						  var totalAccelerationY = 0;

						  for (var i = 0; i < fields.length; i++) {
							var field = fields[i];
							var vectorX = field.pos.x - this.pos.x;
							var vectorY = field.pos.y - this.pos.y;
							var distance = this.pos.distance(field.pos);
							if(distance < 1) field.grow(this);
							if(distance < 100) this.doubleSize = true;
							var force = G(this.forceBetween(field, distance));
							totalAccelerationX += vectorX * force;
							totalAccelerationY += vectorY * force;
						  }
						  this.ac = new Vector(totalAccelerationX, totalAccelerationY);

						  totalAccelerationX = 0;
						  totalAccelerationY = 0;
						  for (var i = 0; i < particles.length; i++) {
							var field = particles[i];
							if(field === this || !field.alive) continue;
							var vectorX = field.pos.x - this.pos.x;
							var vectorY = field.pos.y - this.pos.y;
							var distance = this.pos.distance(field.pos);
							if(distance < 1) {
							  if(this.mass >= field.mass) {
								var massRatio = this.mass / field.mass;
								if(particles.length <= maxParticles && this.mass>40) {
								  this.alive = false;
								  this.nova = true;
								  collidedMass += this.mass;
								} else this.grow(field);
							  } else this.alive = false;
							}
							if(this.alive) {
							  var force = G(this.forceBetween(field, distance));
							  totalAccelerationX += vectorX * G(force);
							  totalAccelerationY += vectorY * G(force);
							}
						  }

						  var travelDist = this.pos.distance(this.lastPos ? this.lastPos : this.pos);
						  this.velocity = travelDist - (this.lastDistance ? this.lastDistance : travelDist);
						  this.lastDistance = travelDist;
						  this.lastPos = this.pos.clone();

						  this.ac.add(new Vector(totalAccelerationX, totalAccelerationY));
						  this.lastPos = this.pos.clone();
						  // if(this.mass > 20) {
						  //   var chance = 1 / (this.mass - 20);
						  //   if(Math.random()>chance) {
						  //     this.supernova = true;
						  //     this.supernovaDur = 10;
						  //     this.alive = false;
						  //     if(particles.length <= maxParticles) collidedMass += this.mass;
						  //     delete this.size;
						  //   }
						  // }
						};
						Particle.prototype.grow = function (another) {
						  this.mass += another.mass;
						  this.nova = true;
						  another.alive = false;
						  delete this.size;
						};
						Particle.prototype.breakApart = function(minMass, maxParts) {
						  if(!minMass) minMass = 1;
						  if(!maxParts) maxParts = 2;
						  var remainingMass = this.mass;
						  var num = 0;
						  while(remainingMass > 0) {
							var np = new Particle(this.pos.clone().random(this.mass), new Vector(0,0));
							np.mass = 1 + Math.random() * (remainingMass - 1);
							if(num>=maxParts-1) np.mass = remainingMass;
							np.mass = np.mass < minMass ? minMass : np.mass;
							remainingMass -= np.mass;
							num++;
						  }
						  this.nova = true;
						  delete this.size;
						  this.alive = false;
						};
						Particle.prototype.forceBetween = function(another, distance) {
						  var distance = distance? distance : this.pos.distance(another.pos);
						  return (this.mass * another.mass) / sqr(distance);
						};

						//******************************************************
						//This certainly doesn't *sub*mit to particles, that's for sure
						var ParticleEmitter=function(pos, vc, ang) {
						  // to do config options for emitter - random, static, show emitter, emitter color, etc
						  this.pos = pos;
						  this.vc = vc;
						  this.ang = ang || 0.09;
						  this.color = "#999";
						}
						ParticleEmitter.prototype.emit = function() {
						  var angle = this.vc.angle() +
							  this.ang - (Math.random() * this.ang * 2);
						  var magnitude = this.vc.magnitude();
						  var position = this.pos.clone();
								position.add(
								new Vector(
								  ~~((Math.random() * 100) - 50) * drawScale,
								  ~~((Math.random() * 100) - 50) * drawScale
								));
						  var velocity = Vector.fromAngle(angle, magnitude);
						  return new Particle(position,velocity);
						};

						//******************************************************
						// Use it, Luke
						// to do collapse functionality into particle
						var Force=function(pos, m) {
						  this.pos = pos;
						  this.mass = m || 100;
						}
						Force.prototype.grow = function (another) {
						  this.mass += another.mass;
						  this.burp = true;
						  another.alive = false;
						};



						var G=function(data) {
						  return 0.00674 * data;
						}

						//******************************************************
						var canvas = document.createElement('canvas');
						canvas.classList.add('fun');
						ui.window.appendChild(canvas);
						var ctx = canvas.getContext('2d');
						canvas.width = ui.window.offsetWidth;
						canvas.height = ui.window.offsetHeight;
						var canvasWidth = canvas.width;
						var canvasHeight = canvas.height;
						lib.onresize.push(function() {
							canvas.width = ui.window.offsetWidth;
							canvas.height = ui.window.offsetHeight;
							canvasWidth = canvas.width;
							canvasHeight = canvas.height;
						});

						var renderToCanvas = function (width, height, renderFunction) {
							var buffer = document.createElement('canvas');
							buffer.width = width;
							buffer.height = height;
							renderFunction(buffer.getContext('2d'));
							return buffer;
						};

						maxParticles = 500;
						emissionRate = 1;
						drawScale = 1.3;
						minParticleSize = 2;
						emitters = [
						  //br
						  new ParticleEmitter(
							new Vector(
							  canvasWidth / 2 * drawScale + 400,
							  canvasHeight / 2 * drawScale
							  ),
							Vector.fromAngle(2, 5),
							1
						  ),
						  //   // bl
						  //   new ParticleEmitter(
						  //   new Vector(
						  //     canvasWidth / 2 * drawScale - 400,
						  //     canvasHeight / 2 * drawScale + 400
						  //     ),
						  //   Vector.fromAngle(1.5, 1),
						  //   1
						  // ),
							// tl
						  new ParticleEmitter(
							new Vector(
							  canvasWidth / 2 * drawScale - 400,
							  canvasHeight / 2 * drawScale
							  ),
							Vector.fromAngle(5, 5),
							1
						  ),
						  //   // tr
						  //   new ParticleEmitter(
						  //   new Vector(
						  //     canvasWidth / 2 * drawScale + 400,
						  //     canvasHeight / 2 * drawScale - 400
						  //     ),
						  //   Vector.fromAngle(4.5, 1),
						  //   1
						  // )
						];
						forces  = [
						  new Force(
							new Vector((canvasWidth / 2 * drawScale) ,
									   (canvasHeight / 2 * drawScale)), 1800)
						];

						var loop=function() {
							if(!game.haveFun.list.star.running){
								canvas.width=ui.window.offsetWidth;
								canvas.height=ui.window.offsetHeight;
								return;
							}
							clear();
							update();
							draw();
							queue();
						}
						game.haveFun.starLoop=loop;
						game.haveFun.starStop=function(){
							game.haveFun.list.star.running=false;
						};


						var clear=function() {
						  ctx.clearRect(0, 0, canvas.width, canvas.height);
						}

						var ctr = 0;
						var c = [
						  'rgba(255,255,255,',
						  'rgba(0,150,255,',
						  'rgba(255,255,128,',
						  'rgba(255,255,255,'
						];
						var rndc=function() {
						  return c[~~(Math.random() * c.length-1)];
						}
						var c2 = 'rgba(255,64,32,';
						var addNewParticles=function() {
						  var _emit = function() {
							var ret = 0;
							for (var i = 0; i < emitters.length; i++) {
							  for (var j = 0; j < emissionRate; j++) {
								var p = emitters[i].emit();
								p.color = ( ctr % 10 === 0 )?
								  ( Math.random() * 5 <= 1 ? c2 : rndc() )
								  : rndc();
								p.mass = ~~(Math.random() * 5);
								particles.push(p);
								ret += p.mass;
								ctr++;
							  }
							}
							return ret;
						  };
						  if(collidedMass !== 0) {
							while(collidedMass !== 0) {
							  collidedMass -= _emit();
							  collidedMass = collidedMass<0 ? 0 :collidedMass;
							}
						  }
						  if (particles.length > maxParticles)
							return;
						  _emit();
						}

						var CLIPOFFSCREEN = 1,
							BUFFEROFFSCREEN = 2,
							LOOPSCREEN = 3;

						var isPositionAliveAndAdjust=function(particle,check) {
						  return true;
						//   var pos = particle.pos;
						//   if(!check) check = BUFFEROFFSCREEN;
						//   if(check === CLIPOFFSCREEN) {
						//     return !(!particle.alive ||
						//              pos.x < 0 ||
						//              (pos.x / drawScale) > boundsX ||
						//              pos.y < 0 ||
						//              (pos.y / drawScale) > boundsY);
						//   } else if(check === BUFFEROFFSCREEN) {
						//     return !(!particle.alive ||
						//              pos.x < -boundsX * drawScale ||
						//              pos.x > 2 * boundsX * drawScale ||
						//              pos.y < -boundsY * drawScale ||
						//              pos.y > 2 * boundsY * drawScale);
						//   } else if(check === LOOPSCREEN) {
						//     if (pos.x < 0) pos.x = boundsX * drawScale;
						//     if ((pos.x / drawScale) > boundsX) pos.x = 0;
						//     if (pos.y < 0) pos.y = boundsY * drawScale;
						//     if ((pos.y / drawScale) > boundsY) pos.y = 0;
						//     return true;
						//   }
						}

						var plotParticles=function(boundsX, boundsY) {
						  var currentParticles = [];
						  for (var i = 0; i < particles.length; i++) {
							var particle = particles[i];
							particle.reactToForces(forces);
							if(!isPositionAliveAndAdjust(particle))
							  continue;
							particle.move();
							currentParticles.push(particle);
						  }
						}

						var offscreenCache = {};
						var renderParticle=function(p) {
							var position = p.pos;
							if(!p.size) p.size = Math.floor(p.mass / 100);


							if(!p.opacity) p.opacity = 0.05;
							if(p.velocity > 0) {
							  if(p.opacity<=0.18)
								p.opacity += 0.04;
							}
							  if(p.opacity>0.08)
								p.opacity -= 0.02;

							var actualSize = p.size / drawScale;
							actualSize = actualSize < minParticleSize ? minParticleSize : actualSize;
							if(p.mass>8) actualSize *= 2;
							if(p.nova) {
							  actualSize *= 4;
							  p.nova = false;
							}
							if(p.doubleSize) {
							  p.doubleSize = false;
							  actualSize *= 2;
							}
							// if(p.supernova) {
							//   actualSize *= 6;
							//   opacity = 0.15;
							//   p.supernovaDur = p.supernovaDur - 1;
							//   if(p.supernovaDur === 0)
							//     p.supernova = false;
							// }
							var cacheKey = actualSize + '_' + p.opacity + '_' + p.color;
							var cacheValue = offscreenCache[cacheKey];
							if(!cacheValue) {
							  cacheValue = renderToCanvas(actualSize * 32, actualSize * 32, function(ofsContext) {
								var opacity = p.opacity;
								var fills = [
								  {size:actualSize/2,  opacity:1},
								  {size:actualSize,  opacity:opacity},
								  {size:actualSize * 2, opacity:opacity / 2},
								  {size:actualSize * 4, opacity:opacity / 3},
								  {size:actualSize * 8, opacity:opacity / 5},
								  {size:actualSize * 16, opacity:opacity / 16}
								];
								ofsContext.beginPath();
								for(var f in fills) {
								  f = fills[f];
								  ofsContext.fillStyle = p.color + f.opacity + ')';
								  ofsContext.arc(
									actualSize * 16,
									actualSize * 16,
									f.size , 0, Math.PI*2, true);
								  ofsContext.fill();
								}
								ofsContext.closePath();
							  });
							  offscreenCache[cacheKey] = cacheValue;
							}
							  var posX = p.pos.x / drawScale;
							var posY = p.pos.y / drawScale;
							ctx.drawImage(cacheValue, posX, posY);
						}

						var fills = [
						  {size:15,opacity:1  },
						  {size:25,opacity:0.3},
						  {size:50,opacity:0.1} ];

						var renderScene=function(ofsContext) {
						  for (var i = 0; i < forces.length; i++) {
							var p = forces[i];
							var position = p.pos;
							var opacity = 1;

							ofsContext.beginPath();
							for(var f in fills) {
							  f = fills[f];
							  var o = p.burp === true ? 1 : f.opacity;
							  p.burp = false;
							  // ofsContext.fillStyle = 'rgba(255,255,255,' + o + ')';
							  // ofsContext.arc(position.x / drawScale,
							  //   position.y / drawScale,
							  //   f.size / drawScale, 0, Math.PI*2, true);
							  // ofsContext.fill();
							}
							ofsContext.closePath();
						  }

						  for (var i = 0; i < particles.length; i++) {
							var p = particles[i];
							renderParticle(p);
						  }
						}

						var draw=function() {
						  renderScene(ctx);
						}

						var update=function() {
						  addNewParticles();
						  plotParticles(canvas.width, canvas.height);
						}

						var queue=function() {
						  window.requestAnimationFrame(loop);
						}

						loop();

					}
				},
				snow:function(){
					game.haveFun.list.snow.running=true;
					if(game.haveFun.snowStart){
						game.haveFun.snowStart();
					}
					else{
						/*
						* 自由下雪 snowFall
						* author：xuanfeng
						* time: 2014-01-11
						*/
						// 控制下雪
						var canvas;
						var snowFall=function(snow) {
							// 可配置属性
							snow = snow || {};
							this.maxFlake = snow.maxFlake || 200;	//最多片数
							this.flakeSize = snow.flakeSize || 10;	//雪花形状
							this.fallSpeed = snow.fallSpeed || 2;	//坠落速度
							this.status = 0;	//0-初始化、1-开始下雪、2-停止下雪、3-暂停下雪、4-继续下雪
						}

						// 兼容写法
						var requestAnimationFrame = window.requestAnimationFrame ||
												window.mozRequestAnimationFrame ||
												window.webkitRequestAnimationFrame ||
												window.msRequestAnimationFrame ||
												window.oRequestAnimationFrame ||
												function(callback) { setTimeout(callback, 1000 / 60); };
						var cancelAnimationFrame = window.cancelAnimationFrame ||
												window.mozCancelAnimationFrame ||
												window.webkitCancelAnimationFrame ||
												window.msCancelAnimationFrame ||
												window.oCancelAnimationFrame;

						// 开始下雪
						snowFall.prototype.start = function(){
							if(this.status == 1 || this.status == 4){
								// 已经在下雪则不作处理
								return false;
							}
							this.status = 1;

							// 创建画布
							snowCanvas.apply(this);
							// 创建雪花形状
							createFlakes.apply(this);
							// 画雪
							drawSnow.apply(this)
						}

						// 停止下雪
						snowFall.prototype.stop = function(){
							if(this.status == 2 || this.status == 0 || !this.canvas){
								return false;
							}
							// 停止动画循环
							this.pause();
							this.status = 2;
							// 删除画布
							this.canvas.parentNode.removeChild(this.canvas);
							this.canvas = null;
						}

						// 暂停下雪
						snowFall.prototype.pause = function(){
							if(this.status == 3){
								return false;
							}
							this.status = 3;
							cancelAnimationFrame(this.loop)
						};
						// 继续下雪
						snowFall.prototype.resume = function(){
							if(this.status == 3 && this.canvas){
								this.status = 4;
								// 动画的计时控制
								var that=this;
								this.loop = requestAnimationFrame(function() {
									drawSnow.apply(that)
								});
							}
						};

						// 创建画布
						var snowCanvas=function() {
							// 添加Dom结点
							var snowcanvas = document.createElement("canvas");
							snowcanvas.classList.add('fun');
							snowcanvas.id = "snowfall";
							ui.window.appendChild(snowcanvas);
							canvas=snowcanvas;
							this.canvas = snowcanvas;
							this.ctx = snowcanvas.getContext("2d");
							// 窗口大小改变的处理
							lib.onresize.push(function() {
								snowcanvas.width = ui.window.offsetWidth;
								snowcanvas.height = ui.window.offsetHeight
							});
							snowcanvas.width = ui.window.offsetWidth;
							snowcanvas.height = ui.window.offsetHeight;
						}

						// 雪运动对象
						var flakeMove=function(canvasWidth, canvasHeight, flakeSize, fallSpeed) {
							this.x = Math.floor(Math.random() * canvasWidth); 	//x坐标
							this.y = Math.floor(Math.random() * canvasHeight);	//y坐标
							this.size = Math.random() * flakeSize + 2;			//形状
							this.maxSize = flakeSize;							 //最大形状
							this.speed = Math.random() * 1 + fallSpeed;		      //坠落速度
							this.fallSpeed = fallSpeed;						  //坠落速度
							this.velY = this.speed;							  //Y方向速度
							this.velX = 0;									    //X方向速度
							this.stepSize = Math.random() / 30;				    //步长
							this.step = 0 									    //步数
						}

						flakeMove.prototype.update = function() {
							var x = this.x,
								y = this.y;

							// 左右摆动(余弦)
							this.velX *= 0.98;
							if (this.velY <= this.speed) {
								this.velY = this.speed
							}
							this.velX += Math.cos(this.step += 0.05) * this.stepSize;

							this.y += this.velY;
							this.x += this.velX;
							// 飞出边界的处理
							if (this.x >= canvas.width || this.x <= 0 || this.y >= canvas.height || this.y <= 0) {
								this.reset(canvas.width, canvas.height)
							}
						};

						// 飞出边界-放置最顶端继续坠落
						flakeMove.prototype.reset = function(width, height) {
							this.x = Math.floor(Math.random() * width);
							this.y = 0;
							this.size = Math.random() * snow.flakeSize + 2;
							this.speed = Math.random() * 1 + snow.fallSpeed;
							this.velY = this.speed;
							this.velX = 0;
						};

						// 渲染雪花-随机形状
						flakeMove.prototype.render = function(ctx) {
							var snowFlake = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
							snowFlake.addColorStop(0, "rgba(255, 255, 255, 0.9)");
							snowFlake.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
							snowFlake.addColorStop(1, "rgba(255, 255, 255, 0)");
							ctx.save();
							ctx.fillStyle = snowFlake;
							ctx.beginPath();
							ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
							ctx.fill();
							ctx.restore();
						};

						// 创建雪花-定义形状
						var createFlakes=function() {
							var maxFlake = this.maxFlake,
								flakes = this.flakes = [],
								canvas = this.canvas;
							for (var i = 0; i < 200; i++) {
								flakes.push(new flakeMove(canvas.width, canvas.height, this.flakeSize, this.fallSpeed))
							}
						}

						// 画雪
						var drawSnow=function() {
							var maxFlake = this.maxFlake,
								flakes = this.flakes;
							var ctx = this.ctx, canvas = this.canvas, that = this;
							// 清空雪花
							ctx.clearRect(0, 0, canvas.width, canvas.height);
							for (var e = 0; e < maxFlake; e++) {
								flakes[e].update();
								flakes[e].render(ctx);
							}
							// 一帧一帧的画
							this.loop = requestAnimationFrame(function() {
								drawSnow.apply(that);
							});
						}

						// 调用及控制方法
						var snow = new snowFall();
						game.haveFun.snowStart=function(){
							snow.start();
						}
						game.haveFun.snowStop=function(){
							game.haveFun.list.snow.running=false;
							snow.stop();
						}
						game.haveFun.snowSize=function(){
							if(game.haveFun.list.snow.size=='large'){
								game.haveFun.list.snow.size='small';
								snow.maxFlake=80;
								snow.flakeSize=3;
								snow.fallSpeed=1;
								if(this&&this.innerHTML){
									this.innerHTML='大雪';
								}
								game.saveConfig('coinSnowSize',true);
							}
							else{
								game.haveFun.list.snow.size='large';
								snow.maxFlake=200;
								snow.flakeSize=10;
								snow.fallSpeed=2;
								if(this&&this.innerHTML){
									this.innerHTML='小雪';
								}
								game.saveConfig('coinSnowSize',false);
							}
						}
						if(lib.config.coinSnowSize){
							game.haveFun.snowSize();
						}
						snow.start();
					}
				},
				firework:function(){
					if(game.haveFun.list.firework.running) return;
					game.haveFun.list.firework.running=true;
					if(game.haveFun.fireworkLoop){
						game.haveFun.fireworkLoop();
					}
					else{
						// when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
						// not supported in all browsers though and sometimes needs a prefix, so we need a shim
						var requestAnimFrame = ( function() {
							return window.requestAnimationFrame ||
										window.webkitRequestAnimationFrame ||
										window.mozRequestAnimationFrame ||
										function( callback ) {
											window.setTimeout( callback, 1000 / 60 );
										};
						})();

						// now we will setup our basic variables for the demo
						var canvas = document.createElement( 'canvas' ),
								ctx = canvas.getContext( '2d' ),
								// full screen dimensions
								cw = ui.window.offsetWidth,
								ch = ui.window.offsetHeight,
								// firework collection
								fireworks = [],
								// particle collection
								particles = [],
								// starting hue
								hue = 120,
								// when launching fireworks with a click, too many get launched at once without a limiter, one launch per 5 loop ticks
								limiterTotal = 5,
								limiterTick = 0,
								// this will time the auto launches of fireworks, one launch per 80 loop ticks
								timerTotal = 80,
								timerTick = 0,
								mousedown = false,
								// mouse x coordinate,
								mx,
								// mouse y coordinate
								my;

						// set canvas dimensions
						canvas.width = cw;
						canvas.height = ch;
						ui.window.appendChild(canvas);
						canvas.classList.add('fun');
						lib.onresize.push(function(){
							cw=ui.window.offsetWidth;
							ch=ui.window.offsetHeight;
							canvas.width = cw;
							canvas.height = ch;
						});

						// now we are going to setup our function placeholders for the entire demo

						// get a random number within a range
						var random=function( min, max ) {
							return Math.random() * ( max - min ) + min;
						}

						// calculate the distance between two points
						var calculateDistance=function( p1x, p1y, p2x, p2y ) {
							var xDistance = p1x - p2x,
									yDistance = p1y - p2y;
							return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
						}

						// create firework
						var Firework=function( sx, sy, tx, ty ) {
							// actual coordinates
							this.x = sx;
							this.y = sy;
							// starting coordinates
							this.sx = sx;
							this.sy = sy;
							// target coordinates
							this.tx = tx;
							this.ty = ty;
							// distance from starting point to target
							this.distanceToTarget = calculateDistance( sx, sy, tx, ty );
							this.distanceTraveled = 0;
							// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
							this.coordinates = [];
							this.coordinateCount = 3;
							// populate initial coordinate collection with the current coordinates
							while( this.coordinateCount-- ) {
								this.coordinates.push( [ this.x, this.y ] );
							}
							this.angle = Math.atan2( ty - sy, tx - sx );
							this.speed = 2;
							this.acceleration = 1.05;
							this.brightness = random( 50, 70 );
							// circle target indicator radius
							this.targetRadius = 1;
						}

						// update firework
						Firework.prototype.update = function( index ) {
							// remove last item in coordinates array
							this.coordinates.pop();
							// add current coordinates to the start of the array
							this.coordinates.unshift( [ this.x, this.y ] );

							// cycle the circle target indicator radius
							if( this.targetRadius < 8 ) {
								this.targetRadius += 0.3;
							} else {
								this.targetRadius = 1;
							}

							// speed up the firework
							this.speed *= this.acceleration;

							// get the current velocities based on angle and speed
							var vx = Math.cos( this.angle ) * this.speed,
									vy = Math.sin( this.angle ) * this.speed;
							// how far will the firework have traveled with velocities applied?
							this.distanceTraveled = calculateDistance( this.sx, this.sy, this.x + vx, this.y + vy );

							// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
							if( this.distanceTraveled >= this.distanceToTarget ) {
								createParticles( this.tx, this.ty );
								// remove the firework, use the index passed into the update function to determine which to remove
								fireworks.splice( index, 1 );
							} else {
								// target not reached, keep traveling
								this.x += vx;
								this.y += vy;
							}
						}

						// draw firework
						Firework.prototype.draw = function() {
							ctx.beginPath();
							// move to the last tracked coordinate in the set, then draw a line to the current x and y
							ctx.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
							ctx.lineTo( this.x, this.y );
							ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
							ctx.stroke();

							ctx.beginPath();
							// draw the target for this firework with a pulsing circle
							ctx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
							ctx.stroke();
						}

						// create particle
						var Particle=function( x, y ) {
							this.x = x;
							this.y = y;
							// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
							this.coordinates = [];
							this.coordinateCount = 5;
							while( this.coordinateCount-- ) {
								this.coordinates.push( [ this.x, this.y ] );
							}
							// set a random angle in all possible directions, in radians
							this.angle = random( 0, Math.PI * 2 );
							this.speed = random( 1, 10 );
							// friction will slow the particle down
							this.friction = 0.95;
							// gravity will be applied and pull the particle down
							this.gravity = 1;
							// set the hue to a random number +-20 of the overall hue variable
							this.hue = random( hue - 20, hue + 20 );
							this.brightness = random( 50, 80 );
							this.alpha = 1;
							// set how fast the particle fades out
							this.decay = random( 0.015, 0.03 );
						}

						// update particle
						Particle.prototype.update = function( index ) {
							// remove last item in coordinates array
							this.coordinates.pop();
							// add current coordinates to the start of the array
							this.coordinates.unshift( [ this.x, this.y ] );
							// slow down the particle
							this.speed *= this.friction;
							// apply velocity
							this.x += Math.cos( this.angle ) * this.speed;
							this.y += Math.sin( this.angle ) * this.speed + this.gravity;
							// fade out the particle
							this.alpha -= this.decay;

							// remove the particle once the alpha is low enough, based on the passed in index
							if( this.alpha <= this.decay ) {
								particles.splice( index, 1 );
							}
						}

						// draw particle
						Particle.prototype.draw = function() {
							ctx. beginPath();
							// move to the last tracked coordinates in the set, then draw a line to the current x and y
							ctx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
							ctx.lineTo( this.x, this.y );
							ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
							ctx.stroke();
						}

						// create particle group/explosion
						var createParticles=function( x, y ) {
							// increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
							var particleCount = 30;
							while( particleCount-- ) {
								particles.push( new Particle( x, y ) );
							}
						}

						// main demo loop
						var loop=function() {
							// if(lib.config.coin_free_playpackconfig&&!_status.imchoosing){
							// 	canvas.style.display='none';
							// }
							// else{
							// 	canvas.style.display='';
							// }
							// this function will run endlessly with requestAnimationFrame
							if(!game.haveFun.list.firework.running){
								canvas.width=cw;
								canvas.height=ch;
								return;
							}
							else{
								requestAnimFrame( loop );
							}

							// increase the hue to get different colored fireworks over time
							hue += 0.5;

							// normally, clearRect() would be used to clear the canvas
							// we want to create a trailing effect though
							// setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
							ctx.globalCompositeOperation = 'destination-out';
							// decrease the alpha property to create more prominent trails
							ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
							ctx.fillRect( 0, 0, cw, ch );
							// change the composite operation back to our main mode
							// lighter creates bright highlight points as the fireworks and particles overlap each other
							ctx.globalCompositeOperation = 'lighter';

							// loop over each firework, draw it, update it
							var i = fireworks.length;
							while( i-- ) {
								fireworks[ i ].draw();
								fireworks[ i ].update( i );
							}

							// loop over each particle, draw it, update it
							var i = particles.length;
							while( i-- ) {
								particles[ i ].draw();
								particles[ i ].update( i );
							}

							// launch fireworks automatically to random coordinates, when the mouse isn't down
							if( timerTick >= timerTotal ) {
								if( !mousedown ) {
									// start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
									fireworks.push( new Firework( cw / 2, ch, random( 0, cw ), random( 0, ch / 2 ) ) );
									timerTick = 0;
								}
							} else {
								timerTick++;
							}

							// limit the rate at which fireworks get launched when mouse is down
							if( limiterTick >= limiterTotal ) {
								if( mousedown ) {
									// start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
									fireworks.push( new Firework( cw / 2, ch, mx, my ) );
									limiterTick = 0;
								}
							} else {
								limiterTick++;
							}
						}


						if(lib.config.touchscreen){
							ui.window.addEventListener( 'touchmove', function( e ) {
								mx = e.touches[0].clientX/game.documentZoom - canvas.offsetLeft;
								my = e.touches[0].clientY/game.documentZoom - canvas.offsetTop;
							});
							ui.window.addEventListener( 'touchstart', function( e ) {
								mousedown = true;
							});
							ui.window.addEventListener( 'touchend', function( e ) {
								mousedown = false;
							});
						}
						else{
							// mouse event bindings
							// update the mouse coordinates on mousemove
							ui.window.addEventListener( 'mousemove', function( e ) {
								mx = e.pageX/game.documentZoom - canvas.offsetLeft;
								my = e.pageY/game.documentZoom - canvas.offsetTop;
							});

							// toggle mousedown state and prevent canvas from being selected
							ui.window.addEventListener( 'mousedown', function( e ) {
								e.preventDefault();
								mousedown = true;
							});

							ui.window.addEventListener( 'mouseup', function( e ) {
								e.preventDefault();
								mousedown = false;
							});
						}

						// once the window loads, we are ready for some fireworks!
						game.haveFun.fireworkLoop=loop;
						game.haveFun.fireworkStop=function(){
							game.haveFun.list.firework.running=false;
						},
						loop();
					}
				}
			}
		},
		help:{
			'富甲天下':'<ul><li>每完成一次对局，可获得一定数量的金币'+
			'<li>战斗胜利可额外获得20金币，每杀死一个敌人可获得10金币（托管无效）'+
			'<li>使用的武将越强，获得的金币数越少'+
			'<li>执行以下操作时，将扣除金币：<ul><li>作弊：20金币<li>换将卡：3金币<li>'+
			'自由选将：10金币<li>手气卡：3金币<li>换人：10金币</ul>'+
			'<li>金币可用于购买烟花等游戏特效（点击右上角的金币按钮）'+
			'<li>修改金币：<br>game.changCoin'+
			'<li>默认下雪：<br>game.haveFun.alwaysSnow'
		}
	};
});
