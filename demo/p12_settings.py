from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Everything that changes between environments comes from the environment."""

    model_config = SettingsConfigDict(env_prefix="CLUE_")

    database_url: str  # required: no default, so a missing value stops the boot
    release: str = "dev"
    work_ms: int = Field(default=50, ge=0)
    slow_ms: int = Field(default=2000, ge=0)
    startup_delay_s: float = Field(default=0.0, ge=0)
