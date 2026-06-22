from models import ReportSummary


def print_summary(summary: ReportSummary):

    print()
    print("=" * 80)
    print(summary.filename)
    print("=" * 80)

    print()
    print("Data Source Summary")
    print("-" * 40)

    for source, count in summary.data_source_summary.items():
        print(f"{source:<30}{count}")

    print("-" * 40)
    print(
        f"{'Grand Total':<30}"
        f"{summary.total_transactions}"
    )

    print()
    print("Error Summary (ACCOUNT_AGGREGATOR)")
    print("-" * 40)

    for error, count in summary.error_summary.items():
        print(f"{error:<40}{count}")

    print("-" * 40)
    print(
        f"{'Grand Total':<40}"
        f"{summary.total_aa_transactions}"
    )