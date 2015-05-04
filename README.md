# httpdump

Simple websocket powered request catcher.

## Build

Install the [Go compiler](https://golang.org/) and run

```
git clone https://github.com/aboutsource/httpdump
cd httpdump
make
```

## Run

```
./httpdumpd
```

### Options

- **-listen** address to listen to (default: ":8080")
- **-root** location of static files (default: ".")

## Use

Visit [http://localhost:8080](http://localhost:8080) with your Webbrowser and
send requests to http://localhost:8080/dump/.

```
curl -X POST -H 'Content-Type: application/json' -d '[1,2,3]' http://localhost:8080/dump/
curl -X DELETE http://localhost:8080/dump/some/arbitrary/path
```

## License (MIT)

```
Copyright (c) 2015 The httpdump contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
