(function() {
  'use strict';

  var Socket = function(url) {
    this.url = url;
    this.sock = null;
    this.handlers = [];
    this.open();
    window.setInterval(this.ping.bind(this), 10000);
  };

  Socket.prototype.open = function() {
    this.sock = new WebSocket(this.url);

    this.sock.addEventListener('error', console.debug.bind(console));

    this.sock.addEventListener('message', (function(e) {
      this.dispatch(JSON.parse(e.data));
    }).bind(this));

    this.sock.addEventListener('close', (function() {
      window.setTimeout(this.open.bind(this), 3000);
    }).bind(this));
  };

  Socket.prototype.isOpen = function() {
    return this.sock.readyState === WebSocket.OPEN;
  };

  Socket.prototype.ping = function() {
    this.isOpen() && this.sock.send('ping');
  };

  Socket.prototype.register = function(handler, thisArg) {
    this.handlers.push(handler.bind(thisArg || this));
  };

  Socket.prototype.dispatch = function(data) {
    this.handlers.forEach(function(handler) {
      handler.call(this, data);
    });
  };

  var Wrapper = function(selector, host) {
    this.el = document.querySelector(selector);
    this.host = host;
  };

  Wrapper.prototype.push = function(msg) {
    var container = document.createElement('div');
    container.classList.add('request');

    var date = document.createElement('div');
    date.classList.add('date');
    date.textContent = (new Date()).toLocaleTimeString();
    container.appendChild(date);

    var h2 = document.createElement('h2');
    h2.textContent = [msg.proto, msg.method, msg.url].join(' ');
    container.appendChild(h2);

    var headers = document.createElement('div');
    headers.classList.add('headers');

    Object.keys(msg.header).forEach(function(header) {
      var div = document.createElement('div');
      div.textContent = header + ': ' + msg.header[header].join(', ');
      headers.appendChild(div);
    });

    container.appendChild(headers);

    var body = document.createElement('div');
    body.classList.add('body');

    var contentType = (msg.header['Content-Type'] || []).join('');

    if (contentType.indexOf('application/json') > -1) {
      body.textContent = JSON.stringify(JSON.parse(msg.body), null, 2);
    } else {
      body.textContent = msg.body;
    }

    container.appendChild(body);

    this.el.insertBefore(container, this.el.firstChild);
  };

  var loc = window.location;
  var wrapper = new Wrapper('#wrapper', loc.host);
  var socket = new Socket('ws://' + loc.host + '/socket');
  socket.register(wrapper.push, wrapper);

}).call(this)
