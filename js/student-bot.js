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
	
	// callback function for when move completes
	bot.move_completed(function(reason) {
	  // reason can be null, "WALL_COLLIDE", or "ENEMY_COLLIDE"
	  var action = Math.floor(4 * Math.random());
	  switch (action) {
	    case 0:
	      bot.move_forward(100);
	      break;
	    case 1:
	      bot.move_backward(100);
	      break;
      case 2:
    	  bot.turn_left(90);
    	  break;
      case 3:
    	  bot.turn_right(90);
    	  break;
	  }
	});
	
	// callback function for when turret turn completes
	bot.turret_turn_completed(function() {
	  // always shoot!
	  bot.shoot();
	  var action = Math.floor(2 * Math.random());
	  switch (action) {
      case 0:
    	  bot.turn_turret_left(90);
    	  break;
      case 1:
    	  bot.turn_turret_right(90);
    	  break;
	  }
	});
	
	// callback function for when radar turn completes
	bot.radar_turn_completed(function() {
	  var action = Math.floor(2 * Math.random());
	  switch (action) {
      case 0:
    	  bot.turn_radar_left(90);
    	  break;
      case 1:
    	  bot.turn_radar_right(90);
    	  break;
	  }
	});
	
	// start moving
	bot.move_completed();
	
	// start turning turret
	bot.turret_turn_completed();
	
	// start scanning bots
	bot.radar_turn_completed();
}
