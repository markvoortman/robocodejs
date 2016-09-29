importScripts("base-bot.js");

EnemyBot = BaseBot;

EnemyBot.run = function() {
  var bot = this;
  
  // callback function for when move completes
  bot.move_completed(function(reason) {
    if (reason === null) {
      // keep going in same direction
      bot.move(100);
    }
    else if (reason === "WALL_COLLIDE" || reason === "ENEMY_COLLIDE") {
      // must have hit something so back up
      bot.move_reverse(200);
    }
    else {
      console.log("unknown reason: " + reason);
    }
  });
  
  // callback function for when turn completes
  bot.turn_completed(function() {
    // make only left turns
    bot.turn_left(45);
  });
  
  // callback function for when turret turn completes
  bot.turret_turn_completed(function() {
    // always shoot!
    bot.shoot();
    var action = Math.floor(2 * Math.random());
    switch (action) {
      case 0:
        bot.turn_turret_left(45);
        break;
      case 1:
        bot.turn_turret_right(45);
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
  
  // start turning
  bot.turn_completed();
  
  // start turning turret
  bot.turret_turn_completed();
  
  // start scanning bots
  bot.radar_turn_completed();
}
