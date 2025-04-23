import socketio


sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
sid_map = dict()


from . import events
