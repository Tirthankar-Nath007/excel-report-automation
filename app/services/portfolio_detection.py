from app.utils.filename_parser import extract_portfolio

_FOLDER_MAP: dict[str, str] = {
    "usedcars": "usedcars",
    "usedcar": "usedcars",
    "used_cars": "usedcars",
    "commercial": "commercial",
}


class PortfolioDetectionService:
    def detect(self, filename: str, relative_path: str | None = None) -> str:
        """
        For folder uploads, the top-level folder name is a strong signal.
        Fall back to filename-based regex detection.
        """
        if relative_path:
            folder = relative_path.split("/")[0].lower()
            normalized = folder.replace("_", "").replace("-", "")
            if normalized in _FOLDER_MAP:
                return _FOLDER_MAP[normalized]
        return extract_portfolio(filename)
