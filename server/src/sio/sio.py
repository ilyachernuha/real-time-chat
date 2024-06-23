import socketio


sio = socketio.AsyncServer(async_mode="asgi")
sid_map = dict()


from . import events
