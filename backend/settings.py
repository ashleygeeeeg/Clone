"""
Configuration management for maligeeAi backend
Uses Pydantic BaseSettings to load environment variables from .env file
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from pathlib import Path


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # ═══════════════════════════════════════════════════════════════
    # DATABASE CONFIGURATION
    # ═══════════════════════════════════════════════════════════════
    mongo_url: str = Field(
        default="mongodb+srv://localhost:27017/",
        description="MongoDB connection string"
    )
    db_name: str = Field(
        default="maligeeai",
        description="MongoDB database name"
    )

    # ═══════════════════════════════════════════════════════════════
    # JWT AUTHENTICATION
    # ═══════════════════════════════════════════════════════════════
    jwt_secret: str = Field(
        default="maligeeai-secret-key-change-in-prod-2025",
        description="Secret key for JWT token signing"
    )
    jwt_algorithm: str = Field(
        default="HS256",
        description="Algorithm for JWT token signing"
    )
    jwt_expiry_hours: int = Field(
        default=72,
        description="JWT token expiry time in hours"
    )

    # ═══════════════════════════════════════════════════════════════
    # LLM INTEGRATION (Emergent AI)
    # ═══════════════════════════════════════════════════════════════
    emergent_llm_key: str = Field(
        default="",
        description="API key for Emergent LLM service"
    )

    # ═══════════════════════════════════════════════════════════════
    # CORS CONFIGURATION
    # ═══════════════════════════════════════════════════════════════
    cors_origins: str = Field(
        default="*",
        description="Comma-separated list of allowed CORS origins"
    )

    # ═══════════════════════════════════════════════════════════════
    # APPLICATION ENVIRONMENT
    # ═══════════════════════════════════════════════════════════════
    environment: str = Field(
        default="development",
        description="Application environment (development, staging, production)"
    )

    class Config:
        """Pydantic config"""
        env_file = Path(__file__).parent.parent / ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Create global settings instance
settings = Settings()
