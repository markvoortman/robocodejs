importScripts("base-robot.js");

StudentBot = BaseRobot;

StudentBot.run = function() {
	var robot = this;
	robot.turn_radar_left(45);
	function move(forward) {
    if (forward) {
      robot.move_forward(100, {
        DONE: function() {
          move(!forward);
        }
      });
    }
    else {
      robot.move_backward(100, {
        DONE: function() {
          move(!forward);
        }
      });
    }
  }
  move(true);
  /*	
	robot.turn_turret_right(45);
	robot.move_forward(Math.random()*400, {
		DONE: function() {
			robot.shoot();
			robot.turn_right(Math.random()*90, {
				DONE: function() {
					robot.shoot();
					robot._run();
				}
			}); 
		},
		ENEMY_COLLIDE: function() {
			robot.shoot();
			robot.move_backward(100, {
				DONE: function() {
					robot._run();
				},
				WALL_COLLIDE: function() {
					robot._run();
				}
			});
		},
		WALL_COLLIDE: function() {
			robot.turn_left(180, {
				DONE: function() {
					robot.shoot();
					robot._run();
				}
			});
		}
	});
	*/
}
