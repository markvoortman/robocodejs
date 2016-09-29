importScripts("base-bot.js");

EnemyBot = BaseBot;

EnemyBot.run = function() {
  var bot = this;
  
  // callback function for when move completes
  bot.move_completed(function(reason) {
    if (reason === null) {
      bot.shoot();
      var action = Math.floor(2 * Math.random());
      switch (action) {
        case 0:
          bot.move_forward(Math.random()*400);
          break;
        case 1:
          bot.turn_right(Math.random()*90);
          break;
      }
    }
    else if (reason === "ENEMY_COLLIDE") {
      bot.shoot();
      bot.move_backward(100);
    }
    else if (reason === "WALL_COLLIDE") {
      bot.shoot();
      bot.turn_left(180);
    }
    else {
      console.log("unknown reason: " + reason);
    }
  });
  
  // callback function for when turret turn completes
  bot.turret_turn_completed(function() {
    // always shoot!
    bot.shoot();
  });
  
  // callback function for when radar turn completes
  bot.radar_turn_completed(function() {
    // TODO
  });
  
  bot.shoot();
  bot.move_forward(Math.random()*400);
  bot.turn_turret_right(45);
}
