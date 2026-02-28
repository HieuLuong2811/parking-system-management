from sqlmodel import SQLModel


class DeleteResponse(SQLModel):
    message: str
