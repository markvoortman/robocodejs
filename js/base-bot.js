BaseBot = {
  // storage for callback functions
  _onMoveEnd: null,
  _onTurnEnd: null,
  _onTurnGunEnd: null,
  _onTurnRadarEnd: null,
  _onEnemyScan: null,
  _onEnemyScanEnd: null,
  _onEnemyScanEndTimeout: null,
  _lastMoveDistance: null,
  _lastTurnAngle: null,
  _lastTurnGunAngle: null,
  _lastTurnRadarAngle: null,
  _moveEndTimeout: null,
  _turnEndTimeout: null,
  _turnGunEndTimeout: null,
  _turnRadarEndTimeout: null,
  onMoveEnd: function(cb) {
    if (cb) {
      this._onMoveEnd = cb;
    }
    else {
      if (this._onMoveEnd) {
        this._onMoveEnd(null);
      }
    }
  },
  onTurnEnd: function(cb) {
    if (cb) {
      this._onTurnEnd = cb;
    }
    else {
      if (this._onTurnEnd) {
        this._onTurnEnd();
      }
    }
  },
  onTurnGunEnd: function(cb) {
    if (cb) {
      this._onTurnGunEnd = cb;
    }
    else {
      if (this._onTurnGunEnd) {
        this._onTurnGunEnd();
      }
    }
  },
  onTurnRadarEnd: function(cb) {
    if (cb) {
      this._onTurnRadarEnd = cb;
    }
    else {
      if (this._onTurnRadarEnd) {
        this._onTurnRadarEnd();
      }
    }
  },
  onEnemyScan: function(cb) {
    if (cb) {
      this._onEnemyScan = cb;
    }
    else {
      if (this._onEnemyScan) {
        this._onEnemyScan();
      }
    }
  },
  onEnemyScanEnd: function(cb) {
    if (cb) {
      this._onEnemyScanEnd = cb;
    }
    else {
      if (this._onEnemyScanEnd) {
        this._onEnemyScanEnd();
      }
    }
  },
  move: function(distance) {
    if (!distance) { distance = 0; }
    // clear timeout
    if (this._moveEndTimeout) {
      clearTimeout(this._moveEndTimeout);
      this._moveEndTimeout = null;
    }
    // TODO: rounding should not be necessary
    distance = Math.round(distance);
    if (distance === 0 && this._lastMoveDistance === 0) {
      // nothing to do
      var bot = this;
      this._moveEndTimeout = setTimeout(function() {
        bot.onMoveEnd();
      }, 5);
      return;
    }
    this._lastMoveDistance = distance;
    this._send({
      signal: "MOVE",
      distance: distance
    });
  },
  turn: function(angle) {
    if (!angle) { angle = 0; }
    // clear timeout
    if (this._turnEndTimeout) {
      clearTimeout(this._turnEndTimeout);
      this._turnEndTimeout = null;
    }
    // TODO: rounding should not be necessary
    angle = Math.round(angle);
    if (angle === 0 && this._lastTurnAngle === 0) {
      // nothing to do
      var bot = this;
      this._turnEndTimeout = setTimeout(function() {
        bot.onTurnEnd();
      }, 5);
      return;
    }
    this._lastTurnAngle = angle;
    this._send({
      signal: "TURN",
      angle: angle
    });
  },
  turnGun: function(angle) {
    if (!angle) { angle = 0; }
    // clear timeout
    if (this._turnGunEndTimeout) {
      clearTimeout(this._turnGunEndTimeout);
      this._turnGunEndTimeout = null;
    }
    // TODO: rounding should not be necessary
    angle = Math.round(angle);
    if (angle === 0 && this._lastTurnGunAngle === 0) {
      // nothing to do
      var bot = this;
      this._turnGunEndTimeout = setTimeout(function() {
        bot.onTurnGunEnd();
      }, 5);
      return;
    }
    this._lastTurnGunAngle = angle;
    this._send({
      signal: "TURN_GUN",
      angle: angle
    });
  },
  turnRadar: function(angle) {
    if (!angle) { angle = 0; }
    // clear timeout
    if (this._turnRadarEndTimeout) {
      clearTimeout(this._turnRadarEndTimeout);
      this._turnRadarEndTimeout = null;
    }
    // TODO: rounding should not be necessary
    angle = Math.round(angle);
    if (angle === 0 && this._lastTurnRadarAngle === 0) {
      // nothing to do
      var bot = this;
      this._turnRadarEndTimeout = setTimeout(function() {
        bot.onTurnRadarEnd();
      }, 5);
      return;
    }
    this._lastTurnRadarAngle = angle;
    this._send({
      signal: "TURN_RADAR",
      angle: angle
    });
  },
  normalizeHeading: function(angle) {
    // TODO: rounding should not be necessary
    angle = Math.round(angle);
    while (angle < 0) {
      angle += 360;
    }
    return angle % 360;
  },
  normalizeBearing: function(angle) {
    // TODO: rounding should not be necessary
    angle = Math.round(angle);
    if (angle < 0) {
      while (angle < -180) {
        angle += 360;
      }
    }
    else {
      while (angle > 180) {
        angle -= 360;
      }
    }
    return angle;
  },
  normalizeAngle: function(oldAngle, newAngle) {
    oldAngle = this.normalizeHeading(oldAngle);
    newAngle = this.normalizeHeading(newAngle);
    return this.normalizeBearing(oldAngle - newAngle);
  },
  shoot: function() {
    this._send({
      signal: "SHOOT"
    });
  },
  _receive: function(msg) {
    var msg_obj = JSON.parse(msg);
    switch (msg_obj.signal) {
      case "CALLBACK":
        if (msg_obj.moveEnd && this._onMoveEnd) {
          var reason = null;
          if (msg_obj.status === "ENEMY_COLLIDE") {
            reason = "ENEMY_COLLIDE";
          }
          else if (msg_obj.status === "WALL_COLLIDE") {
            reason = "WALL_COLLIDE";
          }
          this._onMoveEnd(reason);
        }
        if (msg_obj.turnEnd && this._onTurnEnd) {
          this._onTurnEnd();
        }
        if (msg_obj.turnGunEnd && this._onTurnGunEnd) {
          this._onTurnGunEnd();
        }
        if (msg_obj.turnRadarEnd && this._onTurnRadarEnd) {
          this._onTurnRadarEnd();
        }
        if (msg_obj.enemyScan && this._onEnemyScan) {
          if (this._onEnemyScanEndTimeout) {
            clearTimeout(this._onEnemyScanEndTimeout);
          }
          var bot = this;
          this._onEnemyScanEndTimeout = setTimeout(function() {
            bot._onEnemyScanEndTimeout = null;
            if (bot._onEnemyScanEnd) {
              bot._onEnemyScanEnd();
            }
          }, 100);
          this._onEnemyScan(msg_obj.enemy);
        }
        break;
      case "UPDATE":
        for (var key in msg_obj) {
          if (key !== "signal") {
            this[key] = msg_obj[key];
          }
        }
        break;
      case "RUN":
        this._run();
        break;
    }
  },
  _send: function(msg_obj, callback) {    
    var msg = JSON.stringify(msg_obj);
    postMessage(msg);
  },
  _run: function() {
    this.run();
  },
  run: function() {
    // will be overwritten by child bots
  }
}

onmessage = function(e) {
  BaseBot._receive(e.data);
};
