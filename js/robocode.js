$(document).ready(function() {
  var canvas = $("#canvas");
  var ctx = canvas[0].getContext("2d");
  var robots = [];
  var bullets = [];
  
  // make canvas the size of the window
  canvas[0].width = window.innerWidth;
  canvas[0].height = window.innerHeight;
  
  console.log = function() {};
  
  // utility functions
  var Utils = {
    degree2radian: function(a) {
      return a * (Math.PI/180);
    },
    distance: function(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
    },
    is_point_in_square: function(x1, y1, x2, y2, width, height) {
      if ((x1>=x2) && (x1<=(x2+width)) && (y1>=y2) && (y1<=(y2+height))) {
        return true;
      }
      else {
        return false;
      }
    },
    is_point_in_triangle: function(x, y, x1, y1, x2, y2, x3, y3) {
      var p  = {x:x,  y:y};
      var p1 = {x:x1, y:y1};
      var p2 = {x:x2, y:y2};
      var p3 = {x:x3, y:y3};
      // use barycentric coordinates
      var alpha = ((p2.y - p3.y)*(p.x - p3.x) + (p3.x - p2.x)*(p.y - p3.y)) /
                  ((p2.y - p3.y)*(p1.x - p3.x) + (p3.x - p2.x)*(p1.y - p3.y));
      var beta = ((p3.y - p1.y)*(p.x - p3.x) + (p1.x - p3.x)*(p.y - p3.y)) /
                 ((p2.y - p3.y)*(p1.x - p3.x) + (p3.x - p2.x)*(p1.y - p3.y));
      var gamma = 1 - alpha - beta;
      return alpha > 0 && beta > 0 && gamma > 0;
    }
  };
  
  var ARENA_WIDTH = canvas.width();
  var ARENA_HEIGHT = canvas.height();
  var ROBOT_SPEED = 1;
  var BULLET_SPEED = 3;
  var MAX_HEALTH = 25;
  var RADAR_RANGE = Math.round(Math.min(ARENA_WIDTH, ARENA_HEIGHT) / 2);
  var RADAR_WIDTH = 40;
  
  var BattleManager = {
    _robots: {},
    _explosions: [],
    _ctx: null,
    init: function(ctx, workers) {
      var battle_manager = this;
      battle_manager._ctx = ctx;
      
      for (var w = 0; w < workers.length; w++) {
        var id = "robot-" + w;
        var robot = {
          id: id,
          arenaWidth: ARENA_WIDTH,
          arenaHeight: ARENA_HEIGHT,
          x: Math.round(ARENA_WIDTH*Math.random()),
          y: Math.round(ARENA_HEIGHT*Math.random()),
          health: MAX_HEALTH,
          maxHealth: MAX_HEALTH,
          forward: true,
          heading: 0,
          gunHeading: 0,
          radarHeading: 0,
          radarRange: RADAR_RANGE,
          radarWidth: RADAR_WIDTH,
          enemyScanned: false,
          bullet: null,
          events: [],
          worker: new Worker(workers[w])
        };
        robot.worker.onmessage = (function(id) {
          return function(e) {
            battle_manager._receive(id, e.data);
          }
        })(id);
        
        battle_manager._robots[id] = robot;
        
        // send the robot its update state
        this.sendRobotUpdate(id);
      }
    },
    _receive: function(id, msg) {
      var msg_obj = JSON.parse(msg);
      var battle_manager = this;
      var robot = battle_manager._robots[id];
      
      console.log(id, msg);
      
      // set progression
      msg_obj.progress = 0;
      
      for (var i = 0; i < robot.events.length; i++) {
        var event = robot.events[i];
        if (event.signal === msg_obj.signal) {
          // replace the event
          robot.events[i] = msg_obj;
          return;
        }
      }
      // add new event
      robot.events.unshift(msg_obj);
    },
    _send: function(id, msg_obj) {
      var battle_manager = this;
      var msg = JSON.stringify(msg_obj);
      battle_manager._robots[id].worker.postMessage(msg);
    },
    _send_all: function(msg_obj) {
      var battle_manager = this;
      for(var r in battle_manager._robots) {
        battle_manager._send(r, msg_obj);
      }
    },
    _run: function() {
      var battle_manager = this;
      
      battle_manager._update();
      battle_manager._draw()
    },
    _update: function () {
      var battle_manager = this;
      
      for (var r in battle_manager._robots) {
        if (battle_manager._robots[r].health <= 0) {
          var robot = battle_manager._robots[r];
          delete battle_manager._robots[r];
          battle_manager._explosions.push({
            x: robot.x,
            y: robot.y,
            progress: 1
          });
        }
      }
      
      for (var r in battle_manager._robots) {
        var robot = battle_manager._robots[r];
        
        if (robot.bullet) {
          
          robot.bullet.x += BULLET_SPEED * Math.cos(Utils.degree2radian(robot.bullet.heading-90));
          robot.bullet.y -= BULLET_SPEED * Math.sin(Utils.degree2radian(robot.bullet.heading-90));
          
          var wall_collide = !Utils.is_point_in_square(robot.bullet.x, ARENA_HEIGHT-robot.bullet.y, 2, 2, ARENA_WIDTH-2, ARENA_HEIGHT-2);
          if (wall_collide) {
            robot.bullet = null;
          }
          else {
            for (var r2 in battle_manager._robots) {
              var enemy_robot = battle_manager._robots[r2];
              
              if (robot.id === enemy_robot.id) continue;
              
              var robot_hit = Utils.distance(robot.bullet.x, ARENA_HEIGHT-robot.bullet.y, enemy_robot.x, ARENA_HEIGHT-enemy_robot.y) < 20;
              if (robot_hit) {
                console.log("HIT!");
                enemy_robot.health -= 3;
                battle_manager._explosions.push({
                  x: enemy_robot.x,
                  y: enemy_robot.y,
                  progress: 1
                });
                robot.bullet = null;
                break;
              }
            }
          }
        }
        
        // update radar
        var radarHeading1 = Utils.degree2radian(-(robot.radarHeading-90-robot.radarWidth/2));
        var radarHeading2 = Utils.degree2radian(-(robot.radarHeading-90+robot.radarWidth/2));
        robot.radar_x1 = robot.x + robot.radarRange*Math.cos(radarHeading1);
        robot.radar_y1 = ARENA_HEIGHT-robot.y - robot.radarRange*Math.sin(radarHeading1);
        robot.radar_x2 = robot.x + robot.radarRange*Math.cos(radarHeading2);
        robot.radar_y2 = ARENA_HEIGHT-robot.y - robot.radarRange*Math.sin(radarHeading2);
        robot.enemyScanned = false;
        for (var r2 in battle_manager._robots) {
          var enemy = battle_manager._robots[r2];
          if (robot !== enemy) {
            if (Utils.is_point_in_triangle(enemy.x, ARENA_HEIGHT-enemy.y,
                                           robot.x, ARENA_HEIGHT-robot.y,
                                           robot.radar_x1, robot.radar_y1,
                                           robot.radar_x2, robot.radar_y2)) {
              // TODO: only call back when bot has moved
              var tmpx = enemy.x - robot.x;
              var tmpy = (ARENA_HEIGHT-enemy.y) - (ARENA_HEIGHT-robot.y);
              var enemyBearing = Math.atan2(tmpy, tmpx) * (180/Math.PI) - (robot.heading-90);
              var enemyDistance = Math.sqrt(tmpx*tmpx + tmpy*tmpy);
              robot.enemyScanned = true;
              this._send(r, {
                signal: "CALLBACK",
                enemyScanned: true,
                enemy: {
                  x: enemy.x,
                  y: enemy.y,
                  bearing: this.normalizeBearing(enemyBearing),
                  distance: enemyDistance
                }
              });
            }
          }
        }
        
        // go through events
        for (var e = 0; e < robot.events.length; e++) {
          var event = robot.events.pop();
          if (event === undefined) continue;
          
          switch (event.signal) {
            case "SHOOT":
              if (!robot.bullet) {
                robot.bullet = {
                  x: robot.x,
                  y: robot.y,
                  heading: robot.gunHeading
                };
              }
              break;
            case "MOVE":
              event.progress++;
              
              if (event.distance > 0) {
                robot.forward = true;
              }
              else if (event.distance < 0) {
                robot.forward = false;
              }
              
              var new_x = robot.x + ROBOT_SPEED * (event.distance>0?1:-1) * Math.cos(Utils.degree2radian(robot.heading-90));
              var new_y = (ARENA_HEIGHT-robot.y) + ROBOT_SPEED * (event.distance>0?1:-1) * Math.sin(Utils.degree2radian(robot.heading-90));
              
              var wall_collide = !Utils.is_point_in_square(new_x, new_y, 2, 2, ARENA_WIDTH-2, ARENA_HEIGHT-2);
              
              if (wall_collide) {
                console.log("wall " + robot.heading + " " + robot.x + " " + new_x + " " + wall_collide);
                //robot.health -= 1;
                this._send(r, {
                  signal: "CALLBACK",
                  status: "WALL_COLLIDE",
                  moveCompleted: true
                });
                break;
              }
              
              for (var r2 in battle_manager._robots) {
                var enemy = battle_manager._robots[r2];
                
                if (robot.id === enemy.id) continue;
                
                var robot_hit = Utils.distance(new_x, new_y, enemy.x, ARENA_HEIGHT-enemy.y) < 25;
                if (robot_hit) {
                  enemy.health--;
                  robot.health--;
                  this._send(r, {
                    signal: "CALLBACK",
                    status: "ENEMY_COLLIDE",
                    moveCompleted: true
                  });
                  break;
                }
              }
              if (robot_hit) {
                // done
              }
              else if (event.progress > Math.abs(event.distance)) {
                console.log("move-over " + robot.id);
                this._send(r, {
                  signal: "CALLBACK",
                  status: "DONE",
                  moveCompleted: true
                });
              }
              else {
                robot.x = new_x;
                robot.y = ARENA_HEIGHT-new_y;
                robot.events.unshift(event);
              }
              break;
            case "TURN":
              if (event.progress === Math.abs(parseInt(event.angle))) {
                this._send(r, {
                  signal: "CALLBACK",
                  status: "DONE",
                  turnCompleted: true
                });
              }
              else {
                robot.heading += (event.angle>0?1:-1);
                robot.heading = this.normalizeHeading(robot.heading);
                event.progress++;
                robot.events.unshift(event);
              }
              break;
            case "TURN_GUN":
              if (event.progress === Math.abs(event.angle)) {
                this._send(r, {
                  signal: "CALLBACK",
                  turnGunCompleted: true
                });
              }
              else {
                robot.gunHeading += (event.angle>0?1:-1);
                robot.gunHeading = this.normalizeHeading(robot.gunHeading);
                event.progress++;
                robot.events.unshift(event);
              }
              break;
            case "TURN_RADAR":
              if (event.progress === Math.abs(event.angle)) {
                this._send(r, {
                  signal: "CALLBACK",
                  turnRadarCompleted: true
                });
              }
              else {
                robot.radarHeading += (event.angle>0?1:-1);
                robot.radarHeading = this.normalizeHeading(robot.radarHeading);
                event.progress++;
                robot.events.unshift(event);
              }
              break;
          }
          
          // send the robot its updated state
          this.sendRobotUpdate(r);
        }
      }
    },
    _draw: function () {
      var battle_manager = this;
      
      battle_manager._ctx.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
      
      function draw_robot(ctx, robot) {
        var body = new Image();
        var gun = new Image();
        var radar = new Image();
        body.src = "img/body.png";
        gun.src = "img/gun.png";
        radar.src = "img/radar.png";
        
        // draw body
        ctx.rotate(Utils.degree2radian(robot.heading-90));
        ctx.drawImage(body, -18, -18, 36, 36);
        ctx.rotate(-Utils.degree2radian(robot.heading-90));
        
        // rotate for gun
        ctx.rotate(Utils.degree2radian(robot.gunHeading-90));
        ctx.drawImage(gun, -25, -10, 54, 20);
        ctx.rotate(-Utils.degree2radian(robot.gunHeading-90));
        
        // rotate for radar
        ctx.rotate(Utils.degree2radian(robot.radarHeading-90));
        ctx.drawImage(radar, -8, -11, 16, 22);
        ctx.rotate(-Utils.degree2radian(robot.radarHeading-90));
      }
      
      // draw robots
      for (var r in battle_manager._robots) {
        var robot = battle_manager._robots[r];
        
        // draw robot
        battle_manager._ctx.save();
        battle_manager._ctx.translate(robot.x, ARENA_HEIGHT-robot.y);
        draw_robot(battle_manager._ctx, robot);
        battle_manager._ctx.restore();
        
        // draw radar beam
        battle_manager._ctx.beginPath();
        battle_manager._ctx.strokeStyle = "blue";
        battle_manager._ctx.moveTo(robot.x, ARENA_HEIGHT-robot.y);
        battle_manager._ctx.lineTo(robot.radar_x1, robot.radar_y1);
        battle_manager._ctx.lineTo(robot.radar_x2, robot.radar_y2);
        battle_manager._ctx.closePath();
        battle_manager._ctx.stroke();
        
        // draw bullet
        if (robot.bullet) {
          battle_manager._ctx.save();
          battle_manager._ctx.translate(robot.bullet.x, ARENA_HEIGHT-robot.bullet.y);
          battle_manager._ctx.rotate(Utils.degree2radian(robot.bullet.heading-90));
          ctx.fillRect(-3, -3, 6, 6);
          battle_manager._ctx.restore();
        }
        
        battle_manager._ctx.strokeText(robot.id + " (" + robot.health + ")", robot.x-20, ARENA_HEIGHT-robot.y+35);
        battle_manager._ctx.fillStyle = "green";
        battle_manager._ctx.fillRect(robot.x-20, ARENA_HEIGHT-robot.y+35, robot.health, 5);
        battle_manager._ctx.fillStyle = "red";
        battle_manager._ctx.fillRect(robot.x-20+robot.health, ARENA_HEIGHT-robot.y+35, robot.maxHealth-robot.health, 5);
        battle_manager._ctx.fillStyle = "black";
      }
      for (var e = 0; e < battle_manager._explosions.length; e++) {
        var explosion = battle_manager._explosions.pop();
        if (explosion.progress <= 17) {
          var explosion_img = new Image();
          explosion_img.src = "img/explosion/explosion1-" + parseInt(explosion.progress) + ".png";
          battle_manager._ctx.drawImage(explosion_img, explosion.x-64, ARENA_HEIGHT-explosion.y-64, 128, 128);
          explosion.progress += .1;
          battle_manager._explosions.unshift(explosion);
        }
      }
    },
    normalizeHeading: function(angle) {
      // TODO: rounding should not be necessary
      angle = Math.round(angle);
      while (angle < 0) {
        angle += 360;
      }
      return angle % 360;
    },
    normalizeBearing: function(angle) {
      // TODO: rounding should not be necessary
      angle = Math.round(angle);
      if (angle < 0) {
        while (angle < -180) {
          angle += 360;
        }
      }
      else {
        while (angle > 180) {
          angle -= 360;
        }
      }
      return angle;
    },
    sendRobotUpdate: function(id) {
      var robot = this._robots[id];
      var state = {
        signal: "UPDATE"
      };
      // send all properties that are a string or number
      for (var key in robot) {
        var val = robot[key];
        if (typeof val === "boolean" || typeof val === "number" || typeof val === "string") {
          state[key] = val;
        }
      }
      this._send(id, state);
    },
    run: function() {
      var battle_manager = this;
      setInterval(function() {
        battle_manager._run();
      }, 10);
      battle_manager._send_all({
        signal: "RUN"
      });
    }
  };
  
  // init and run
  BattleManager.init(ctx, ["js/enemy-bot.js?"+Date.now(), "js/student-bot.js?"+Date.now()]);
  BattleManager.run();
});
