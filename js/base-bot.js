BaseBot = {
  // storage for callback functions
  _onMoveCompleted: null,
  _onTurnCompleted: null,
  _onTurnGunCompleted: null,
  _onTurnRadarCompleted: null,
  _onEnemyScanned: null,
  onMoveCompleted: function(cb) {
    if (cb) {
      this._onMoveCompleted = cb;
    }
    else {
      if (this._onMoveCompleted) {
        this._onMoveCompleted(null);
      }
    }
  },
  onTurnCompleted: function(cb) {
    if (cb) {
      this._onTurnCompleted = cb;
    }
    else {
      if (this._onTurnCompleted) {
        this._onTurnCompleted();
      }
    }
  },
  onTurnGunCompleted: function(cb) {
    if (cb) {
      this._onTurnGunCompleted = cb;
    }
    else {
      if (this._onTurnGunCompleted) {
        this._onTurnGunCompleted();
      }
    }
  },
  onTurnRadarCompleted: function(cb) {
    if (cb) {
      this._onTurnRadarCompleted = cb;
    }
    else {
      if (this._onTurnRadarCompleted) {
        this._onTurnRadarCompleted();
      }
    }
  },
  onEnemyScanned: function(cb) {
    if (cb) {
      this._onEnemyScanned = cb;
    }
    else {
      if (this._onEnemyScanned) {
        this._onEnemyScanned();
      }
    }
  },
  move: function(distance) {
    // TODO: rounding should not be necessary
    distance = Math.round(distance);
    this._send({
      signal: "MOVE",
      distance: distance
    });
  },
  turn: function(angle) {
    // TODO: rounding should not be necessary
    angle = Math.round(angle);
    this._send({
      signal: "TURN",
      angle: angle
    });
  },
  turnGun: function(angle) {
    // TODO: rounding should not be necessary
    angle = Math.round(angle);
    this._send({
      signal: "TURN_GUN",
      angle: angle
    });
  },
  turnRadar: function(angle) {
    // TODO: rounding should not be necessary
    angle = Math.round(angle);
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
  shoot: function() {
    this._send({
      signal: "SHOOT"
    });
  },
  _receive: function(msg) {
    var msg_obj = JSON.parse(msg);
    switch (msg_obj.signal) {
      case "CALLBACK":
        if (msg_obj.moveCompleted && this._onMoveCompleted) {
          var reason = null;
          if (msg_obj.status === "ENEMY_COLLIDE") {
            reason = "ENEMY_COLLIDE";
          }
          else if (msg_obj.status === "WALL_COLLIDE") {
            reason = "WALL_COLLIDE";
          }
          this._onMoveCompleted(reason);
        }
        if (msg_obj.turnCompleted && this._onTurnCompleted) {
          this._onTurnCompleted();
        }
        if (msg_obj.turnGunCompleted && this._onTurnGunCompleted) {
          this._onTurnGunCompleted();
        }
        if (msg_obj.turnRadarCompleted && this._onTurnRadarCompleted) {
          this._onTurnRadarCompleted();
        }
        if (msg_obj.enemyScanned && this._onEnemyScanned) {
          this._onEnemyScanned(msg_obj.enemy);
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
