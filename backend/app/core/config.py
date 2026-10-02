from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = (
        "postgresql+psycopg://"
        "cyber_user:cyber_password@localhost:5433/cyber_db"
    )


settings = Settings()