package main

import (
	"flag"
	"fmt"
	"httpdump"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

var (
	root    string
	address string
)

func init() {
	flag.StringVar(&root, "root", ".", "root directory")
	flag.StringVar(&address, "listen", ":8080", "address to listen to")
}

func main() {
	flag.Parse()

	listener, err := net.Listen("tcp", address)

	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	defer listener.Close()

	fmt.Printf("listening on %s\n", address)

	hub := httpdump.New()
	go hub.Run()
	defer hub.Close()

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(root)))
	mux.Handle("/socket", hub.HTTPHandler())

	mux.HandleFunc("/dump/", func(_ http.ResponseWriter, r *http.Request) {
		hub.Dispatch(r)
	})

	go http.Serve(listener, mux)

	sig := make(chan os.Signal)
	signal.Notify(sig, syscall.SIGINT)
	<-sig
}
