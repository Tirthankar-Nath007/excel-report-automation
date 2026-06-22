from dataclasses import dataclass, field


@dataclass
class ReportSummary:
    filename: str
    portfolio: str
    from_date: str
    to_date: str
    data_source_summary: dict[str, int] = field(default_factory=dict)
    error_summary: dict[str, int] = field(default_factory=dict)
    total_transactions: int = 0
    total_aa_transactions: int = 0


@dataclass
class AggregatedSummary:
    portfolio: str
    from_date: str
    to_date: str
    data_source_summary: dict[str, int] = field(default_factory=dict)
    error_summary: dict[str, int] = field(default_factory=dict)
