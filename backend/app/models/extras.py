from pydantic import BaseModel, Field


class NotifyRequest(BaseModel):
    title: str = Field(default="BatDesk", max_length=80)
    body: str = Field(min_length=1, max_length=280)


class ClipboardRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


class OpenUrlRequest(BaseModel):
    url: str = Field(min_length=8, max_length=500)


class LaunchRequest(BaseModel):
    app: str


class AwakeRequest(BaseModel):
    enabled: bool
