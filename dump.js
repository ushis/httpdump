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

  var Container = function(request) {
    this.req = request;
  }

  Container.prototype.heading = function() {
    return [this.req.proto, this.req.method, this.req.url].join(' ');
  }

  Container.prototype.headers = function() {
    var headers = Object.keys(this.req.header).map(function(header) {
      return [header, ': ', this.req.header[header].join(', ')].join('');
    }, this);

    return ['Host: ' + this.req.host].concat(headers);
  };

  Container.prototype.body = function() {
    var contentType = (this.req.header['Content-Type'] || []).join('');

    if (contentType.indexOf('application/json') < 0) {
      return this.req.body;
    }

    try {
      return JSON.stringify(JSON.parse(this.req.body), null, 2);
    } catch (_) {
      return this.req.body;
    }
  };

  Container.prototype.build = function() {
    var el = document.createElement('div');
    el.classList.add('request');

    var heading =  document.createElement('h2');
    heading.textContent = this.heading();
    el.appendChild(heading);

    heading.addEventListener('click', function() {
      el.classList.toggle('active');
    });

    var headers = document.createElement('div');
    headers.classList.add('headers');
    el.appendChild(headers);

    this.headers().forEach(function(header) {
      var div = document.createElement('div');
      div.textContent = header;
      headers.appendChild(div);
    });

    var body = document.createElement('div');
    body.classList.add('body');
    body.textContent = this.body();
    el.appendChild(body);

    return el;
  };


  var Collector = function(selector, title) {
    this.wrapper = document.querySelector(selector);
    this.title = title;
  };

  Collector.prototype.updateTitle = function() {
    document.title = ['(', this.length(), ') ', this.title].join('');
  };

  Collector.prototype.length = function() {
    return this.wrapper.childNodes.length;
  };

  Collector.prototype.push = function(request) {
    var container = new Container(request);
    this.wrapper.insertBefore(container.build(), this.wrapper.firstChild);
    this.updateTitle();
  };

  var collector = new Collector('#wrapper', 'HTTP Dump');
  var socket = new Socket('ws://' + window.location.host + '/socket');
  socket.register(collector.push, collector);

}).call(this)
