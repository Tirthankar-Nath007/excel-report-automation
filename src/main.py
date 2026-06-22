from pathlib import Path

from processor import PerfiosReportProcessor
from formatter import print_summary


REPORTS_DIR = Path("reports")


def find_online_reports():

    return [
        file
        for file in REPORTS_DIR.glob("*.xlsx")
        if "ONLINE" in file.name.upper()
    ]


def main():

    processor = PerfiosReportProcessor()

    files = find_online_reports()

    if not files:
        print("No ONLINE reports found.")
        return

    for file in files:
        summary = processor.process(file)
        print_summary(summary)


if __name__ == "__main__":
    main()