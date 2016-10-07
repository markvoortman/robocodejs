importScripts("base-bot.js");

StudentBot = BaseBot;

StudentBot.run = function() {
  var bot = this;
  
  var wall = -1;
  
  bot.onMoveEnd(function(reason) {
    wall++;
    wall %= 4;
    bot.turn(90);
    bot.turnGun(bot.normalizeAngle((wall+2)*90, bot.gunHeading));
    bot.turnRadar(bot.normalizeAngle((wall+2)*90, bot.radarHeading));
  });
  
  bot.onTurnEnd(function() {
    bot.move(Math.max(bot.arenaWidth, bot.arenaHeight));
  });
  
  var enemyScan = false;
  bot.onTurnRadarEnd(function() {
    if (!enemyScan) {
      bot.turnGun(bot.normalizeAngle((wall+2)*90, bot.gunHeading));
      bot.turnRadar(bot.normalizeAngle((wall+2)*90, bot.radarHeading));
    }
  });
  
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
  
  // start moving to the wall
  bot.move(Math.max(bot.arenaWidth, bot.arenaHeight));
}
