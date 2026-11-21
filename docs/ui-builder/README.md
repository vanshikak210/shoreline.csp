# Shoreline page for the OCS UI Builder

`shoreline-showcase.json` is a UI Builder page file (schemaVersion 1, `ocs-ui-page`) that
presents Shoreline Connect with the builder's own blocks: header, problem and partner, what the
site does, Shoreline's 2025 numbers, **live data from our Flask API**, links into the site, how we
built it, team, our GitHub issues board and visitor feedback.

Use it: open https://pages.opencodingsociety.com/ui-builder/ signed in, press **Import JSON**,
pick this file, then **Publish**. It passed the builder's own import and publish checks.

The "Data from your API" block reads `GET https://shoreline-api.opencodingsociety.com/api/shoreline/stats`
(public, counts only, no personal data; list `stats`, value `value`, label `label`).
