from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.staticfiles import StaticFiles
import socketio
from sqlalchemy.exc import SQLAlchemyError
from .database import init_db
from .bg_tasks import scheduler
from . import html_generator
from .sio.sio import sio
from .exceptions import AccessTokenValidationError, FieldSubmitError
from .users.router import router as users_router
from .auth.router import router as auth_router
from .rooms.router import router as rooms_router
from .s3 import S3


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await init_db()
    html_generator.preload_templates()
    scheduler.start()
    await S3.create_client()


@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown()
    await S3.close_client()


@app.exception_handler(FieldSubmitError)
async def field_submit_error_handler(request: Request, exc: FieldSubmitError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "field": exc.field
        }
    )


@app.exception_handler(AccessTokenValidationError)
async def access_token_validation_error_handler(request: Request, exc: AccessTokenValidationError):
    return JSONResponse(
        status_code=401,
        content={"detail": str(exc)}
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_error_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=500,
        content={"detail": "Unexpected database error"}
    )


@app.get("/ping", response_class=PlainTextResponse)
async def ping():
    return "pong"


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(rooms_router)

app.mount("/public", StaticFiles(directory="public"))
app.mount("/socket.io", socketio.ASGIApp(sio))
