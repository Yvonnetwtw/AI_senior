from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import webbrowser

if __name__ == '__main__':
    root=Path(__file__).resolve().parent
    address='http://127.0.0.1:8769'
    try:
        server=ThreadingHTTPServer(('127.0.0.1',8769),partial(SimpleHTTPRequestHandler,directory=str(root)))
    except OSError:
        print('Port 8769 is already in use. If this site is already running, open '+address)
        print('Otherwise stop the other server and try again.')
    else:
        print('Website: '+address+' ; Keep this window open. Ctrl+C stops the server.')
        webbrowser.open(address)
        try:server.serve_forever()
        except KeyboardInterrupt:pass
        finally:server.server_close()
