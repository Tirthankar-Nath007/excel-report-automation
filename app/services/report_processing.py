from __future__ import annotations

import shutil
import tempfile
from pathlib import Path

import pandas as pd
from fastapi import UploadFile

from app.models.report import AggregatedSummary, ReportSummary
from app.utils.filename_parser import extract_dates, extract_portfolio


class ReportProcessingService:
    REQUIRED_COLUMNS = ["Data Source", "Error Code"]

    def _get_alltxns_sheet(self, sheet_names: list[str]) -> str:
        for sheet in sheet_names:
            if sheet.endswith("ALLTXNS_1"):
                return sheet
        raise ValueError("Could not find ALLTXNS_1 sheet in workbook")

    async def process_upload(self, file: UploadFile) -> ReportSummary:
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = Path(tmp.name)
        try:
            return self._process_path(tmp_path, file.filename or "unknown.xlsx")
        finally:
            tmp_path.unlink(missing_ok=True)

    def _process_path(self, path: Path, original_filename: str) -> ReportSummary:
        with pd.ExcelFile(path) as excel:
            sheet = self._get_alltxns_sheet(excel.sheet_names)
            df = pd.read_excel(excel, sheet_name=sheet)

        missing = [c for c in self.REQUIRED_COLUMNS if c not in df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")

        data_source_summary: dict[str, int] = (
            df["Data Source"].value_counts().to_dict()
        )
        aa_df = df[df["Data Source"] == "ACCOUNT_AGGREGATOR"]
        error_summary: dict[str, int] = (
            aa_df["Error Code"].fillna("UNKNOWN").value_counts().to_dict()
        )

        portfolio = extract_portfolio(original_filename)
        from_date, to_date = extract_dates(original_filename)

        return ReportSummary(
            filename=original_filename,
            portfolio=portfolio,
            from_date=from_date,
            to_date=to_date,
            data_source_summary=data_source_summary,
            error_summary=error_summary,
            total_transactions=len(df),
            total_aa_transactions=len(aa_df),
        )

    def aggregate(self, summaries: list[ReportSummary]) -> AggregatedSummary:
        assert summaries, "Cannot aggregate empty list"
        data_source: dict[str, int] = {}
        error: dict[str, int] = {}
        for s in summaries:
            for k, v in s.data_source_summary.items():
                data_source[k] = data_source.get(k, 0) + v
            for k, v in s.error_summary.items():
                error[k] = error.get(k, 0) + v
        return AggregatedSummary(
            portfolio=summaries[0].portfolio,
            from_date=min(s.from_date for s in summaries),
            to_date=max(s.to_date for s in summaries),
            data_source_summary=data_source,
            error_summary=error,
        )
