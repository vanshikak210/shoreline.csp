"""Account preference checks (docs/shoreline-backend/shoreline_preferences.py).

Run: venv/bin/python -m unittest discover -s tests -p test_shoreline_preferences.py
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "docs" / "shoreline-backend"))

from shoreline_preferences import MAX_PREFERENCES_BYTES, PreferencesError, clean_preferences  # noqa: E402


class CleanPreferencesTest(unittest.TestCase):
    def test_known_settings_are_kept(self):
        prefs = {
            "language": "te", "textSize": "large", "highContrast": False, "reduceMotion": True,
            "theme": "custom", "customColors": {"page": "#101820", "text": "#f0f0f0", "accent": "#fcb900"},
            "font": "atkinson", "savedThemes": [{"name": "Night", "colors": {}, "font": "serif"}],
            "readAloud": {"enabled": True, "listenButtons": True, "voice": "", "rate": 1.2, "pitch": 1},
        }
        self.assertEqual(clean_preferences(prefs), prefs)

    def test_unknown_keys_are_dropped(self):
        self.assertEqual(clean_preferences({"theme": "sand", "isAdmin": True}), {"theme": "sand"})

    def test_non_objects_are_rejected(self):
        for bad in (None, "theme", ["sand"], 3):
            with self.assertRaises(PreferencesError):
                clean_preferences(bad)

    def test_oversized_preferences_are_rejected(self):
        with self.assertRaises(PreferencesError):
            clean_preferences({"savedThemes": [{"name": "x" * MAX_PREFERENCES_BYTES}]})

    def test_non_json_numbers_are_rejected(self):
        with self.assertRaises(PreferencesError):
            clean_preferences({"readAloud": {"rate": float("nan")}})


if __name__ == "__main__":
    unittest.main()
