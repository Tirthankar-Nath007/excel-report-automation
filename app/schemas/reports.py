from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class FileMetadata(BaseModel):
    filename: str
    relative_path: str | None = None


class ValidationRequest(BaseModel):
    files_metadata: list[FileMetadata]
    mode: Literal["week", "month", "custom"]
    custom_days: int | None = None


class PortfolioValidationResult(BaseModel):
    portfolio: str
    validation_mode: str
    start_date: str
    expected_dates: list[str]
    available_dates: list[str]
    missing_dates: list[str]
    is_complete: bool


class ValidationResponse(BaseModel):
    results: list[PortfolioValidationResult]


class HealthResponse(BaseModel):
    status: str
