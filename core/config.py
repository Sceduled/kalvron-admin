from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    ADMIN_JWT_SECRET: str
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str
    ADMIN_SECRET: str
    PORT: int = 8080

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
