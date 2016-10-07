importScripts("base-bot.js");

StudentBot = BaseBot;

StudentBot.run = function() {
  var bot = this;
  
  // callback function for when move completes
  bot.onMoveEnd(function(reason) {
    if (reason === null) {
      // keep going in same direction
      bot.move(100);
    }
    else if (reason === "ENEMY_COLLIDE" || reason === "WALL_COLLIDE") {
      // must have hit something so back up
      bot.move(bot.forward ? -200 : 200);
    }
    else {
      console.log("unknown reason: " + reason);
    }
  });
  
  // callback function for when turn completes
  bot.onTurnEnd(function() {
    // make only left turns
    bot.turn(-45);
  });
  
  // callback function for when gun turn completes
  bot.onTurnGunEnd(function() {
    // always shoot!
    bot.shoot();
    var action = Math.floor(2 * Math.random());
    switch (action) {
      case 0:
        bot.turnGun(-45);
        break;
      case 1:
        bot.turnGun(45);
        break;
    }
  });
  
  // callback function for when radar turn completes
  bot.onTurnRadarEnd(function() {
    var action = Math.floor(2 * Math.random());
    switch (action) {
      case 0:
        bot.turnRadar(-90);
        break;
      case 1:
        bot.turnRadar(90);
        break;
    }
  });
  
  // start moving by triggering callback
  bot.move();
  
  // start turning by triggering callback
  bot.turn();
  
  // start turning gun by triggering callback
  bot.turnGun();
  
  // start scanning bots by triggering callback
  bot.turnRadar();
}
