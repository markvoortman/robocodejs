importScripts("base-bot.js");

EnemyBot = BaseBot;

EnemyBot.run = function() {
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
    // either turn left or right
    var action = Math.floor(2 * Math.random());
    switch (action) {
      case 0:
        bot.turn(-45);
        break;
      case 1:
        bot.turn(45);
        break;
    }
  });
  
  // callback function for when gun turn completes
  bot.onTurnGunEnd(function() {
    // always shoot when the turn completes
    bot.shoot();
  });
  
  // callback function for when radar turn completes
  var enemyScan = false;
  bot.onTurnRadarEnd(function() {
    // if not enemy in sight then scan all around
    if (!enemyScan) {
      bot.turnRadar(360);
    }
  });
  
  // callback function for when a bot is scanned
  bot.onEnemyScan(function(enemy) {
    enemyScan = true;
    // turn the radar toward the bot
    bot.turnRadar(bot.normalizeBearing(bot.heading - bot.radarHeading + enemy.bearing));
    // turn the gun toward the bot
    var gunAngle = bot.normalizeBearing(bot.heading - bot.gunHeading + enemy.bearing);
    bot.turnGun(gunAngle);
    // shoot when within five degrees
    if (Math.abs(gunAngle) <= 1) {
      bot.shoot()
    }
  });
  
  bot.onEnemyScanEnd(function() {
    enemyScan = false;
    bot.turnRadar();
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
