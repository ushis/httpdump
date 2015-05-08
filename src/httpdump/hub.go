package httpdump

import (
	"golang.org/x/net/websocket"
	"net/http"
)

type Hub struct {
	conns map[string]*Conn
	recv  chan *Message
	reg   chan *Conn
	rm    chan *Conn
	die   chan int
}

func New() *Hub {
	return &Hub{
		make(map[string]*Conn),
		make(chan *Message),
		make(chan *Conn),
		make(chan *Conn),
		make(chan int),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case msg := <-h.recv:
			h.dispatch(msg)
		case conn := <-h.reg:
			h.register(conn)
		case conn := <-h.rm:
			h.remove(conn)
		case <-h.die:
			h.shutdown()
			return
		}
	}
}

func (h *Hub) Close() {
	h.die <- 1
}

func (h *Hub) SocketHandler() websocket.Handler {
	return websocket.Handler(h.connect)
}

func (h *Hub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.recv <- NewMessage(r)
	w.WriteHeader(204)
}

func (h *Hub) connect(conn *websocket.Conn) {
	c := NewConn(conn)
	h.reg <- c
	c.Run()
	h.rm <- c
}

func (h *Hub) dispatch(msg *Message) {
	for _, conn := range h.conns {
		conn.Send(msg)
	}
	msg.Free()
}

func (h *Hub) register(conn *Conn) {
	h.conns[conn.id] = conn
}

func (h *Hub) remove(conn *Conn) {
	conn.Close()
	delete(h.conns, conn.id)
}

func (h *Hub) shutdown() {
	for _, conn := range h.conns {
		h.remove(conn)
	}
	close(h.recv)
	close(h.reg)
	close(h.rm)
	close(h.die)
}
