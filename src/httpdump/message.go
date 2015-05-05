package httpdump

import (
	"io/ioutil"
	"net/http"
)

type Message struct {
	Method        string              `json:"method"`
	Host          string              `json:"host"`
	Url           string              `json:"url"`
	Proto         string              `json:"proto"`
	Header        map[string][]string `json:"header"`
	ContentLength int64               `json:"content_length"`
	Body          string              `json:"body"`
}

var messagePool = make(chan *Message, 100)

func NewMessage(r *http.Request) (msg *Message) {
	select {
	case msg = <-messagePool:
		// got one from the pool
	default:
		// pool is empty
		msg = new(Message)
	}
	msg.Method = r.Method
	msg.Host = r.Host
	msg.Url = r.URL.String()
	msg.Proto = r.Proto
	msg.Header = r.Header
	msg.ContentLength = r.ContentLength

	if body, err := ioutil.ReadAll(r.Body); err == nil {
		msg.Body = string(body)
	}
	return msg
}

func (msg *Message) Free() {
	select {
	case messagePool <- msg:
		// stored it in the pool
	default:
		// pool is full, it's a job for the gc
	}
}
