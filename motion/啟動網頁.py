"""Run with Python 3. Serves only this folder on the local computer."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import webbrowser

if __name__ == '__main__':
    root=Path(__file__).resolve().parent
    handler=partial(SimpleHTTPRequestHandler,directory=str(root))
    try:
        server=ThreadingHTTPServer(('127.0.0.1',8768),handler)
    except OSError:
        print('8768 port is in use. Stop the previous server before starting again.')
    else:
        print('Open http://127.0.0.1:8768 ; press Ctrl+C to stop.')
        webbrowser.open('http://127.0.0.1:8768')
        try:server.serve_forever()
        except KeyboardInterrupt:pass
        finally:server.server_close()
