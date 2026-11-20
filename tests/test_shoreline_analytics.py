"""Shoreline admin analytics aggregation (docs/shoreline-backend/shoreline_analytics.py).

Run: venv/bin/python -m unittest discover -s tests -p test_shoreline_analytics.py
"""

import sys
import unittest
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "docs" / "shoreline-backend"))

from shoreline_analytics import TOP_VOLUNTEER_LIMIT, build_analytics  # noqa: E402


def analytics(**overrides):
    args = dict(member_ids=[], signup_dates=[], survey_choices=[], profiles=[], hours=[], names={})
    args.update(overrides)
    return build_analytics(**args)


class BuildAnalyticsTest(unittest.TestCase):
    def test_empty_community_reports_zeros(self):
        result = analytics()
        self.assertEqual(result["members"], 0)
        self.assertEqual(result["signups"], {"tracked_since": None, "by_month": []})
        self.assertEqual(result["survey"], {"volunteer": 0, "donate": 0, "none": 0})
        self.assertEqual(result["hours"]["total"], 0)
        self.assertEqual(result["hours"]["top_volunteers"], [])

    def test_members_are_counted_once(self):
        self.assertEqual(analytics(member_ids=[1, 2, 2, 3, 1])["members"], 3)

    def test_signups_group_by_month_oldest_first(self):
        result = analytics(signup_dates=[datetime(2026, 11, 3), datetime(2026, 10, 30), datetime(2026, 11, 20), None])
        self.assertEqual(result["signups"]["by_month"], [
            {"month": "2026-10", "count": 1},
            {"month": "2026-11", "count": 2},
        ])
        self.assertEqual(result["signups"]["tracked_since"], "2026-10-30T00:00:00")

    def test_survey_ignores_unknown_choices(self):
        result = analytics(survey_choices=["volunteer", "donate", "volunteer", "hack"])
        self.assertEqual(result["survey"], {"volunteer": 2, "donate": 1, "none": 0})

    def test_profile_fields_are_counted_largest_first(self):
        result = analytics(profiles=[
            {"neighborhood": "La Jolla", "availability": "Weekends", "interests": ["Donations", "Street Outreach"]},
            {"neighborhood": "Pacific Beach", "availability": "", "interests": ["Street Outreach"]},
            {"neighborhood": "Pacific Beach", "availability": "Weekends", "interests": []},
        ])
        self.assertEqual(result["neighborhoods"], [
            {"label": "Pacific Beach", "count": 2},
            {"label": "La Jolla", "count": 1},
        ])
        self.assertEqual(result["availability"], [{"label": "Weekends", "count": 2}])
        self.assertEqual(result["interests"][0], {"label": "Street Outreach", "count": 2})

    def test_hours_totals_activities_and_top_volunteers(self):
        result = analytics(
            hours=[
                {"user_id": 1, "activity": "Event", "hours": 1.5},
                {"user_id": 2, "activity": "Street Outreach", "hours": 3},
                {"user_id": 1, "activity": "Street Outreach", "hours": 2},
            ],
            names={1: "Grace Hopper", 2: "Thomas Edison"},
        )
        hours = result["hours"]
        self.assertEqual(hours["total"], 6.5)
        self.assertEqual(hours["shifts"], 3)
        self.assertEqual(hours["volunteers"], 2)
        self.assertEqual(hours["by_activity"], [
            {"label": "Street Outreach", "hours": 5.0},
            {"label": "Event", "hours": 1.5},
        ])
        self.assertEqual(hours["top_volunteers"], [
            {"name": "Grace Hopper", "hours": 3.5, "shifts": 2},
            {"name": "Thomas Edison", "hours": 3.0, "shifts": 1},
        ])

    def test_top_volunteers_are_capped(self):
        hours = [{"user_id": i, "activity": "Event", "hours": 1} for i in range(TOP_VOLUNTEER_LIMIT + 5)]
        result = analytics(hours=hours, names={i: f"V{i:02d}" for i in range(TOP_VOLUNTEER_LIMIT + 5)})
        self.assertEqual(len(result["hours"]["top_volunteers"]), TOP_VOLUNTEER_LIMIT)


if __name__ == "__main__":
    unittest.main()
