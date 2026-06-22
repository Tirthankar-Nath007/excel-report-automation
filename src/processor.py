from pathlib import Path

import pandas as pd

from models import ReportSummary


class PerfiosReportProcessor:

    REQUIRED_COLUMNS = [
        "Data Source",
        "Error Code",
    ]

    def _get_alltxns_sheet(self, sheet_names: list[str]) -> str:
        for sheet in sheet_names:
            if sheet.endswith("ALLTXNS_1"):
                return sheet

        raise ValueError("Could not find ALLTXNS_1 sheet")

    def process(self, file_path: Path) -> ReportSummary:

        excel = pd.ExcelFile(file_path)

        alltxns_sheet = self._get_alltxns_sheet(
            excel.sheet_names
        )

        df = pd.read_excel(
            file_path,
            sheet_name=alltxns_sheet,
        )

        missing_columns = [
            col
            for col in self.REQUIRED_COLUMNS
            if col not in df.columns
        ]

        if missing_columns:
            raise ValueError(
                f"Missing columns: {missing_columns}"
            )

        data_source_summary = (
            df["Data Source"]
            .value_counts()
            .to_dict()
        )

        aa_df = df[
            df["Data Source"]
            == "ACCOUNT_AGGREGATOR"
        ]

        error_summary = (
            aa_df["Error Code"]
            .fillna("UNKNOWN")
            .value_counts()
            .to_dict()
        )

        return ReportSummary(
            filename=file_path.name,
            data_source_summary=data_source_summary,
            error_summary=error_summary,
            total_transactions=len(df),
            total_aa_transactions=len(aa_df),
        )