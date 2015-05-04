package httpdump

import (
	"code.google.com/p/go-uuid/uuid"
	"fmt"
	"golang.org/x/net/websocket"
	"io"
	"os"
)

type Conn struct {
	*websocket.Conn
	id string
}

func NewConn(conn *websocket.Conn) *Conn {
	return &Conn{conn, uuid.New()}
}

func (c *Conn) Send(msg *Message) {
	if err := websocket.JSON.Send(c.Conn, msg); err != nil {
		fmt.Fprintln(os.Stderr, err)
	}
}

func (c *Conn) Run() {
	buf := make([]byte, 1024)

	for {
		switch _, err := c.Conn.Read(buf); {
		case err == io.EOF:
			// exit on EOF
			return
		case err != nil:
			fmt.Fprintln(os.Stderr, err)
		default:
			// ignore incoming messages
		}
	}
}
