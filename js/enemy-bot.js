importScripts("base-bot.js");

EnemyBot = BaseBot;

EnemyBot.run = function() {
	var bot = this;
	bot.shoot();
	
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
}
