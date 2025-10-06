from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "mongodb://mongo:27017"
    DATABASE_NAME: str = "todo_app"
    SECRET_KEY: str = "your-super-secret-key-for-jwt"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    GOOGLE_CLIENT_ID: str = "YOUR_GOOGLE_CLIENT_ID_FROM_GOOGLE_CLOUD"

    class Config:
        env_file = ".env"

settings = Settings()