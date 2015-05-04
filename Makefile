GOPATH := $(shell pwd)

BIN := httpdumpd
SRC := $(shell find src -name '*.go')

.PHONY: all
	all: $(BIN)

$(BIN): $(SRC)
	go get -d -v $(BIN)/...
	go build $(BIN)

.PHONY: fmt
fmt:
	go fmt httpdump{,d}
