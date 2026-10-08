from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class StatusMessageResponse(BaseModel):
    msg: str
