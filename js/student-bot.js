importScripts("base-bot.js");

StudentBot = BaseBot;

//moving:   actions: move_forwards move_backwards turn_left turn_right
//        callbacks: move_completed
//shooting:   actions: turn_turret_left turn_turret_right shoot
//          callbacks: bot_hit
//radar:  actions: turn_radar_left turn_radar_right
//       callback: bot_detected (not implemented)

StudentBot.run = function() {
	var bot = this;
	bot.turn_radar_left(45);
	function move(forward) {
    bot.shoot();
	  bot.turn_left(45, {
	    "DONE": function() {
        if (forward || true) {
          bot.move_forward(100, {
            DONE: function() {
              move(!forward);
            }
          });
        }
        else {
          bot.move_backward(100, {
            DONE: function() {
              move(!forward);
            }
          });
        }
	    }
	  });
  }
  move(true);
  /*	
	bot.turn_turret_right(45);
	bot.move_forward(Math.random()*400, {
		DONE: function() {
			bot.shoot();
			bot.turn_right(Math.random()*90, {
				DONE: function() {
					bot.shoot();
					bot._run();
				}
			}); 
		},
		ENEMY_COLLIDE: function() {
			bot.shoot();
			bot.move_backward(100, {
				DONE: function() {
					bot._run();
				},
				WALL_COLLIDE: function() {
					bot._run();
				}
			});
		},
		WALL_COLLIDE: function() {
			bot.turn_left(180, {
				DONE: function() {
					bot.shoot();
					bot._run();
				}
			});
		}
	});
	*/
}
