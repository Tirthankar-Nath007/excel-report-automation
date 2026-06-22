from __future__ import annotations

import io
import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.schemas.reports import HealthResponse, ValidationRequest, ValidationResponse
from app.services.excel_export import ExcelExportService
from app.services.portfolio_detection import PortfolioDetectionService
from app.services.report_merge import ReportMergeService
from app.services.report_processing import ReportProcessingService
from app.services.validation import ValidationService
from app.utils.filename_parser import is_online_file, output_filename

router = APIRouter(prefix="/api")

_processing_svc = ReportProcessingService()
_export_svc = ExcelExportService()
_merge_svc = ReportMergeService()
_validation_svc = ValidationService()
_detection_svc = PortfolioDetectionService()

_EXCEL_MEDIA_TYPE = (
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
)


def _excel_response(excel_bytes: bytes, filename: str) -> StreamingResponse:
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type=_EXCEL_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/health", response_model=HealthResponse)
def health() -> dict:
    return {"status": "ok"}


@router.post("/reports/process")
async def process_reports(
    files: list[UploadFile] = File(...),
    portfolio_overrides: str = Form(default="{}"),
) -> StreamingResponse:
    overrides: dict[str, str] = json.loads(portfolio_overrides)
    online_files = [f for f in files if is_online_file(f.filename or "")]
    if not online_files:
        raise HTTPException(status_code=400, detail="No ONLINE files provided")

    by_portfolio: dict[str, list] = {}
    for f in online_files:
        summary = await _processing_svc.process_upload(f)
        # Apply manual override if provided (key = original filename)
        if f.filename in overrides:
            summary.portfolio = overrides[f.filename]
        by_portfolio.setdefault(summary.portfolio, []).append(summary)

    aggregated = {
        p: _processing_svc.aggregate(slist) for p, slist in by_portfolio.items()
    }
    excel_bytes = _export_svc.generate(aggregated)
    portfolios = list(aggregated.keys())
    from_date = min(s.from_date for s in aggregated.values())
    to_date = max(s.to_date for s in aggregated.values())
    fname = output_filename(portfolios, from_date, to_date)
    return _excel_response(excel_bytes, fname)


@router.post("/reports/merge")
async def merge_reports(
    files: list[UploadFile] = File(...),
) -> StreamingResponse:
    report_files = [(f.filename or "report.xlsx", await f.read()) for f in files]
    try:
        excel_bytes, fname = _merge_svc.merge(report_files)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _excel_response(excel_bytes, fname)


@router.post("/reports/folder-process")
async def folder_process(
    files: list[UploadFile] = File(...),
    relative_paths: str = Form(...),
) -> StreamingResponse:
    paths: list[str] = json.loads(relative_paths)
    online_pairs = [
        (f, p)
        for f, p in zip(files, paths)
        if is_online_file(f.filename or "")
    ]
    if not online_pairs:
        raise HTTPException(
            status_code=400, detail="No ONLINE files found in selected folder"
        )

    by_portfolio: dict[str, list] = {}
    for f, rpath in online_pairs:
        summary = await _processing_svc.process_upload(f)
        portfolio = _detection_svc.detect(f.filename or "", rpath)
        summary.portfolio = portfolio
        by_portfolio.setdefault(portfolio, []).append(summary)

    aggregated = {
        p: _processing_svc.aggregate(slist) for p, slist in by_portfolio.items()
    }
    excel_bytes = _export_svc.generate(aggregated)
    portfolios = list(aggregated.keys())
    from_date = min(s.from_date for s in aggregated.values())
    to_date = max(s.to_date for s in aggregated.values())
    fname = output_filename(portfolios, from_date, to_date)
    return _excel_response(excel_bytes, fname)


@router.post("/reports/validate", response_model=ValidationResponse)
def validate_reports(body: ValidationRequest) -> ValidationResponse:
    filenames = [f.filename for f in body.files_metadata]
    rel_paths = [f.relative_path for f in body.files_metadata]
    return _validation_svc.validate(filenames, rel_paths, body.mode, body.custom_days)
