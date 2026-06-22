from dataclasses import dataclass


@dataclass
class ReportSummary:
    filename: str
    data_source_summary: dict[str, int]
    error_summary: dict[str, int]
    total_transactions: int
    total_aa_transactions: int