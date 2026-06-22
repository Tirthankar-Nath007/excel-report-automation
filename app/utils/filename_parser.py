import re


def is_online_file(filename: str) -> bool:
    return "ONLINE" in filename.upper()


def extract_portfolio(filename: str) -> str:
    """
    Find 'tvsCredit' case-insensitively, extract text after it until next '-'.
    Empty suffix -> 'commercial'. Otherwise lowercase the extracted text.
    """
    match = re.search(r"tvsCredit([^-]*)", filename, re.IGNORECASE)
    if not match:
        return "unknown"
    suffix = match.group(1).strip()
    return "commercial" if not suffix else suffix.lower()


def extract_dates(filename: str) -> tuple[str, str]:
    """Returns (from_date, to_date) as ISO strings YYYY-MM-DD."""
    match = re.search(
        r"From-(\d{4}-\d{2}-\d{2})-To-(\d{4}-\d{2}-\d{2})", filename
    )
    if not match:
        raise ValueError(f"Cannot extract dates from filename: {filename}")
    return match.group(1), match.group(2)


def output_filename(portfolios: list[str], from_date: str, to_date: str) -> str:
    """Formats: report_{portfolios}_{DD-MM-YYYY}_to_{DD-MM-YYYY}.xlsx"""
    from_fmt = _iso_to_dmy(from_date)
    to_fmt = _iso_to_dmy(to_date)
    if portfolios:
        portfolio_part = "_".join(sorted(set(portfolios)))
        return f"report_{portfolio_part}_{from_fmt}_to_{to_fmt}.xlsx"
    return f"report_{from_fmt}_to_{to_fmt}.xlsx"


def _iso_to_dmy(date_str: str) -> str:
    y, m, d = date_str.split("-")
    return f"{d}-{m}-{y}"
