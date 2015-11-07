var Base = require('basejs'),
    _ = require('lodash'),
    EventEmitter = require('events').EventEmitter;

var BaseWithEvents = Base.extend();
_.extend(BaseWithEvents.prototype, EventEmitter);

module.exports = BaseWithEvents;
