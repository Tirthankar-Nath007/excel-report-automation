from __future__ import annotations

import datetime

from app.schemas.reports import PortfolioValidationResult, ValidationResponse
from app.services.portfolio_detection import PortfolioDetectionService
from app.utils.filename_parser import extract_dates, is_online_file

_detection_svc = PortfolioDetectionService()


class ValidationService:
    def validate(
        self,
        filenames: list[str],
        relative_paths: list[str | None],
        mode: str,
        custom_days: int | None,
    ) -> ValidationResponse:
        portfolio_dates: dict[str, list[str]] = {}
        for fname, rpath in zip(filenames, relative_paths):
            if not is_online_file(fname):
                continue
            try:
                from_date, _ = extract_dates(fname)
            except ValueError:
                continue
            portfolio = _detection_svc.detect(fname, rpath)
            portfolio_dates.setdefault(portfolio, []).append(from_date)

        results = [
            self._validate_portfolio(portfolio, dates, mode, custom_days)
            for portfolio, dates in portfolio_dates.items()
        ]
        return ValidationResponse(results=results)

    def _validate_portfolio(
        self,
        portfolio: str,
        dates: list[str],
        mode: str,
        custom_days: int | None,
    ) -> PortfolioValidationResult:
        sorted_dates = sorted(set(dates))
        start = datetime.date.fromisoformat(sorted_dates[0])
        num_days = {"week": 7, "month": 30}.get(mode, custom_days or 7)
        expected = [
            (start + datetime.timedelta(days=i)).isoformat()
            for i in range(num_days)
        ]
        available_set = set(sorted_dates)
        missing = [d for d in expected if d not in available_set]
        return PortfolioValidationResult(
            portfolio=portfolio,
            validation_mode=mode,
            start_date=str(start),
            expected_dates=expected,
            available_dates=sorted_dates,
            missing_dates=missing,
            is_complete=len(missing) == 0,
        )
