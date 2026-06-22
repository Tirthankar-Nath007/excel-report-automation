from pathlib import Path

from src.processor import PerfiosReportProcessor


def test_usedcars_report():

    processor = PerfiosReportProcessor()

    summary = processor.process(
        Path(
            "reports/TransactionReport-tvscreditUsedcars-insights-ONLINE-From-2026-06-01-To-2026-06-01.xlsx"
        )
    )

    assert summary.total_transactions == 66
    assert summary.total_aa_transactions == 59