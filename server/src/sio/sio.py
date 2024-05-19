import socketio


sio = socketio.AsyncServer(async_mode="asgi")


from . import events
