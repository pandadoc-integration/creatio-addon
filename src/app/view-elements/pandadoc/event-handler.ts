// Fix for EventHandler not being defined
export function initializeEventHandler(windowObj: any = window): void {
  if (windowObj.EventHandler) {
    // already initialized
    return;
  }

  function EventHandler(this: any, owner: any) {
    this._owner = owner || this;
    this._events = {};
    this._subscribers = undefined;
    this._subscriptions = undefined;
  }

  EventHandler.prototype.emit = function (this: any, id: string, data: any) {
    var listeners = this._events[id];
    if (listeners !== undefined)
      for (var i = 0, n = listeners.length; i < n; ++i) listeners[i].call(this._owner, data);

    var subscribers = this._subscribers;
    if (subscribers !== undefined)
      for (var i = 0, n = subscribers.length; i < n; ++i) subscribers[i].emit(id, data);
  };

  EventHandler.prototype.trigger = EventHandler.prototype.emit;

  EventHandler.prototype.on = function (this: any, id: string, callback: Function) {
    var listeners = this._events[id];
    if (listeners === undefined) listeners = this._events[id] = [];
    listeners.push(callback);
  };

  EventHandler.prototype.addEventListener = EventHandler.prototype.on;

  EventHandler.prototype.removeEventListener = function (
    this: any,
    id: string,
    callback: Function
  ) {
    var listeners = this._events[id];
    if (listeners !== undefined)
      for (var i = listeners.length - 1; i > -1; --i)
        if (listeners[i] === callback) {
          for (; i > 0; --i) listeners[i] = listeners[i - 1];
          listeners.shift();
          break;
        }
  };

  EventHandler.prototype.removeAllEventListeners = function (this: any, id: string) {
    var listeners = this._events[id];
    if (listeners !== undefined) for (var i = listeners.length - 1; i > -1; --i) listeners.shift();
  };

  EventHandler.prototype.removeAllListeners = function (this: any) {
    this._events = {};
  };

  EventHandler.prototype.subscribe = function (this: any, eventHandler: any) {
    if (eventHandler._subscribers === undefined) eventHandler._subscribers = [];
    if (this._subscriptions === undefined) this._subscriptions = [];
    eventHandler._subscribers.push(this);
    this._subscriptions.push(eventHandler);
  };

  EventHandler.prototype.unsubscribe = function (this: any, eventHandler: any) {
    var subscribers = eventHandler._subscribers;
    var subscriptions = this._subscriptions;

    var owner = this._owner;
    for (var i = subscribers.length - 1; i > -1; --i) {
      if (subscribers[i] === owner) {
        for (; i > 0; --i) subscribers[i] = subscribers[i - 1];
        subscribers.shift();
        break;
      }
    }

    for (i = subscriptions.length - 1; i > -1; --i) {
      if (subscriptions[i] === eventHandler) {
        for (; i > 0; --i) subscriptions[i] = subscriptions[i - 1];
        subscriptions.shift();
        break;
      }
    }
  };

  EventHandler.prototype.removeAllSubscribers = function (this: any) {
    var subscribers = this._subscribers;
    if (subscribers !== undefined) {
      var owner = this._owner;
      for (var i = subscribers.length - 1; i > -1; --i) subscribers[i].unsubscribe(owner);
    }
  };

  EventHandler.prototype.removeAllSubscriptions = function (this: any) {
    var subscriptions = this._subscriptions;
    if (subscriptions !== undefined)
      for (var i = subscriptions.length - 1; i > -1; --i) this.unsubscribe(subscriptions[i]);
  };

  EventHandler.prototype.setOwner = function (this: any, owner: any) {
    this._owner = owner || this;
  };

  // Expose globally on the provided window/object
  windowObj.EventHandler = EventHandler;
}
