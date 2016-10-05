# RoboCodeJS - RoboCode for JavaScript

## About
This is a fork of [robojs](https://github.com/gumuz/robojs), which itself is a clone of the original [RoboCode](http://robocode.sourceforge.net/) that is written in Java. Many changes have been made to the robojs fork, including bug fixes and simplifications, as well as the addition of new features. We use RoboCodeJS in the [IT program](https://it.pointpark.edu/) at [Point Park University](http://www.pointpark.edu/). See [this](http://mvoortman.it.pointpark.edu/robocodejs/) page for a demo of RoboCodeJS.

## Documentation
If you want to implement your own bot, please make changes to `run()` in `js/student-bot.js` and only use the public interface documented below. Also, use local variables in the `run()` function to maintain state and do not mutate the bot object itself. This way, backward compatibility should be maintained for the most part, although there certainly will occasionally be changes that break backward compatibility. You should be aware of the following:

Coordinates:
* The left bottom corner coincides with (0, 0) in the coordinate system.
* Heading is absolute, bearing is relative to the heading of the bot.
* A heading of zero degrees coincides with north. Positive angles are clockwise, negative angle counterclockwise.

Properties:
* `x`: x location of bot.
* `y`: y location of bot.
* `forward`: true if moving forward or previously moving forward and stopped now, false otherwise.
* `heading`: heading of bot, ranges between 0 and 360.
* `gunHeading`: heading of gun, ranges between 0 and 360.
* `radarHeading`: heading of radar, ranges between 0 and 360.
* `enemyScanned`: true if an enemy is in range of the radar, false otherwise.

Methods:
* `move(distance)`: move `distance` forward if positive, move backward if negative.
* `turn(angle)`: turn body `angle` degrees relative to current position, positive turns clockwise, negative turns counterclockwise.
* `turnGun(angle)`: turn gun `angle` degrees relative to current position, positive turns clockwise, negative turns counterclockwise.
* `turnRadar(angle)`: turn radar `angle` degrees relative to current position, positive turns clockwise, negative turns counterclockwise.
* `shoot`: fire a bullet.
* `normalizeHeading(angle)`: normalize `angle` to be between 0 and 360, which is then returned.
* `normalizeBearing(angle)`: normalize `angle` to be between -180 and 180, which is then returned.

Callbacks:
* `onMoveCompleted(cb)`: function `cb` is called when a move has been completed. An `reason` argument is provided indicating why the move was completed: `ENEMY_COLLIDE`, `WALL_COLLIDE`, or `null`.
* `onTurnCompleted(cb)`: function `cb` is called when a turn has been completed.
* `onTurnGunCompleted(cb)`: function `cb` is called when a gun turn has been completed.
* `onTurnRadarCompleted(cb)`: function `cb` is called when a radar has been completed.
* `onEnemyScanned(cb)`: function `cb` is called when an enemy has been scanned. An `enemy` argument is provided with `bearing` of the enemy and `distance` to the enemy as properties.
