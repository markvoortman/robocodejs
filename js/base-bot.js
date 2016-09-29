BaseBot = {
  _move_completed: null,
  _turret_turn_completed: null,
  _radar_turn_completed: null,
  move_completed: function(cb) {
    if (cb) {
      this._move_completed = cb;
    }
    else {
      if (this._move_completed) {
        this._move_completed(null);
      }
    }
  },
  turret_turn_completed: function(cb) {
    if (cb) {
      this._turret_turn_completed = cb;
    }
    else {
      if (this._turret_turn_completed) {
        this._turret_turn_completed();
      }
    }
  },
  radar_turn_completed: function(cb) {
    if (cb) {
      this._radar_turn_completed = cb;
    }
    else {
      if (this._radar_turn_completed) {
        this._radar_turn_completed();
      }
    }
  },
  move_forward: function(distance) {
    this._send({
      "signal": "MOVE",
      "distance": distance
    });
  },
  move_backward: function(distance) {
    this._send({
      "signal": "MOVE",
      "distance": -distance
    });
  },
  turn_left: function(angle) {
    this._send({
      "signal": "ROTATE",
      "angle": -angle
    });
  },
  turn_right: function(angle) {
    this._send({
      "signal": "ROTATE",
      "angle": angle
    });
  },
  turn_turret_left: function(angle) {
    this._send({
      "signal": "ROTATE_TURRET",
      "angle": -angle
    });
  },
  turn_turret_right: function(angle) {
    this._send({
      "signal": "ROTATE_TURRET",
      "angle": angle
    });
  },
  turn_radar_left: function(angle) {
    this._send({
      "signal": "ROTATE_RADAR",
      "angle": -angle
    });
  },
  turn_radar_right: function(angle) {
    this._send({
      "signal": "ROTATE_RADAR",
      "angle": angle
    });
  },
  shoot: function() {
    this._send({
      "signal": "SHOOT"
    });
  },
  _receive: function(msg) {
    var msg_obj = JSON.parse(msg);
    switch (msg_obj["signal"]) {
      case "CALLBACK":
        if (msg_obj["move_completed"] && this._move_completed) {
          var reason = null;
          if (msg_obj["status"] === "ENEMY_COLLIDE") {
            reason = "ENEMY_COLLIDE";
          }
          else if (msg_obj["status"] === "WALL_COLLIDE") {
            reason = "WALL_COLLIDE";
          }
          this._move_completed(reason);
        }
        if (msg_obj["turret_turn_completed"] && this._turret_turn_completed) {
          this._turret_turn_completed();
        }
        if (msg_obj["radar_turn_completed"] && this._radar_turn_completed) {
          this._radar_turn_completed();
        }
        break;
      case "INFO":
        this.arena_width = msg_obj["arena_width"];
        this.arena_height = msg_obj["arena_height"];
        break;
      case "UPDATE":
        this.x = msg_obj["x"];
        this.y = msg_obj["y"];
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
