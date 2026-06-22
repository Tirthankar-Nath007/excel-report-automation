from pathlib import Path
import pandas as pd


EXCEL_DIR = Path("./excel-files")


def find_online_files(directory: Path):
    """
    Return all Excel files containing ONLINE in filename.
    """
    return [
        file
        for file in directory.glob("*.xlsx")
        if "ONLINE" in file.name.upper()
    ]


def get_alltxns_sheet_name(sheet_names):
    """
    Find sheet ending with ALLTXNS_1.
    """
    for sheet in sheet_names:
        if sheet.endswith("ALLTXNS_1"):
            return sheet

    raise ValueError("ALLTXNS_1 sheet not found")


def process_report(file_path: Path):
    excel = pd.ExcelFile(file_path)

    alltxns_sheet = get_alltxns_sheet_name(excel.sheet_names)

    df = pd.read_excel(
        file_path,
        sheet_name=alltxns_sheet
    )

    print("\n" + "=" * 80)
    print(f"FILE: {file_path.name}")
    print("=" * 80)

    # ------------------------------------------------------------------
    # Summary 1
    # ------------------------------------------------------------------
    data_source_counts = (
        df["Data Source"]
        .value_counts()
        .sort_values(ascending=False)
    )

    print("\nRow Labels\t\tCount of Data Source")
    for label, count in data_source_counts.items():
        print(f"{label}\t\t{count}")

    print(f"Grand Total\t\t{len(df)}")

    # ------------------------------------------------------------------
    # Summary 2
    # ------------------------------------------------------------------
    aa_df = df[df["Data Source"] == "ACCOUNT_AGGREGATOR"]

    error_counts = (
        aa_df["Error Code"]
        .value_counts()
        .sort_values(ascending=False)
    )

    print("\n")
    print("Row Labels\t\tCount of Data Source")

    for error_code, count in error_counts.items():
        print(f"{error_code}\t{count}")

    print(f"Grand Total\t\t{len(aa_df)}")


def main():
    online_files = find_online_files(EXCEL_DIR)

    if not online_files:
        print("No ONLINE reports found")
        return

    for file in online_files:
        process_report(file)


if __name__ == "__main__":
    main()