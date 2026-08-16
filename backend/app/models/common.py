from pydantic import BaseModel


class ActionResponse(BaseModel):
    success: bool
    message: str
