require "jekyll"
require "tmpdir"
require "fileutils"
require "nokogiri"

PROJECT = File.expand_path("..", __dir__)
require File.expand_path("../../../scripts/publish_project", PROJECT)

def assert(condition, message)
  abort("FAIL: #{message}") unless condition
end

def render_sprint(sprint, with_lessons: true)
  Dir.mktmpdir("sprint-intro-") do |source|
    ProjectPublisher.run("publish", PROJECT, source)
    assert(!File.exist?(File.join(source, "_includes/sprint-direction/csse-sprint-3.html")),
           "Publication does not retain the old authored HTML")
    assert(!File.exist?(File.join(source, "_includes/sprint-intro/csse-sprint-3.md")),
           "Publication does not create an unnamespaced sprint intro")
    published = File.join(source, "_includes/projects/courses/sprint-intro/csse-sprint-3.md")
    assert(File.read(published) == File.read(File.join(PROJECT, "data/sprint-intro/csse-sprint-3.md")),
           "Publication includes the Markdown beside the course YAML")
    timestamp = File.mtime(published)
    ProjectPublisher.run("publish", PROJECT, source)
    assert(File.mtime(published) == timestamp, "Unchanged Markdown is not rewritten")
    File.write(File.join(source, "index.html"), <<~PAGE)
      ---
      title: Sprint 3
      player_page:
        sprint: 3
      ---
      {% assign current_course = "csse" %}
      {% assign lessonsByWeek = site.data.lesson_groups %}
      {% include player-pages/sprint.html %}
    PAGE
    site = Jekyll::Site.new(Jekyll.configuration(
      "source" => source, "destination" => File.join(source, "_site"),
      "includes_dir" => File.join(source, "_includes"), "layouts_dir" => File.join(source, "_layouts"),
      "config" => [], "plugins" => [], "plugins_dir" => [], "quiet" => true,
      "incremental" => false, "baseurl" => "/preview"
    ))
    site.read
    site.data = {
      "csse" => { "Sprint3" => sprint },
      "cs" => { "Shared" => { "description" => "Shared description" } },
      "lesson_groups" => with_lessons ? [{ "name" => 9, "size" => 1, "items" => [] }] : []
    }
    site.generate
    site.render
    site.pages.find { |page| page.name == "index.html" }.output
  end
end

schedule = YAML.safe_load(File.read(File.join(PROJECT, "data/csse.yml")))
sprint = schedule.fetch("Sprint3")
assert(sprint.fetch("direction_include") == "projects/courses/sprint-intro/csse-sprint-3.md",
       "CSSE Sprint 3 selects its own directions")
html = render_sprint(sprint)
document = Nokogiri::HTML.fragment(html)
rubric = document.at_css("section[aria-label='Sprint directions']")
assert(rubric, "Configured directions render")
assert(rubric.previous_element.at_css(".ocs__stats"),
       "Directions follow the complete Weeks card, not its description or week cards")
assert(document.at_css("a[data-player-start]")["href"] == "/preview/csse/week-9/",
       "Existing week navigation is preserved")
assert(!rubric.at_css("a[href*='/csse/sprint3/objectives']"),
       "Directions do not link to the removed objectives notebook")
tables = rubric.css("table")
assert(tables.size == 1, "The phase-based assignment rubric renders")
tables.each do |table|
  rows = table.css("tbody tr")
  bonus_rows, regular_rows = rows.partition { |row| row.css("td")[1].text.include?("Bonus") }
  assert(regular_rows.sum { |row| Integer(row.css("td")[1].text.strip) } == 13,
         "Rubric preserves 13 regular points")
  assert(bonus_rows.size == 1 && bonus_rows.first.css("td")[1].text.strip.match?(/\A1\s+Bonus\z/),
         "Rubric keeps the one-point bonus separate")
  assert(rows.map { |row| row.css("td")[2].text.strip }.tally ==
         { "Phase 1" => 3, "Phase 2" => 2, "Phase 3" => 3, "Phase 4" => 2 },
         "Assignments retain their phase deadlines")
  assert(table["class"] == "ocs__table" && table.parent["class"] == "ocs__table-wrap",
         "Markdown tables use shared OCS styles and responsive wrappers")
  assert(table.css("thead th").map { |cell| cell.text.strip } == %w[Assignment Points Due],
         "Rubric retains assignment, points and due columns")
end
assert(rubric.at_css("h2.ocs__section-title#final-evaluation") &&
       rubric.at_css("h3.ocs__section-title") && rubric.at_css("p.ocs__text") &&
       rubric.at_css("ul.ocs__text"), "Markdown retains OCS heading, paragraph and list styles")
assert(!render_sprint(sprint.reject { |key, _| key == "direction_include" }).include?('aria-label="Sprint directions"'),
       "Sprints without directions keep their existing output")
shared = render_sprint(sprint.merge("shared" => "Shared"))
assert(shared.include?("Shared description") && shared.include?('aria-label="Sprint directions"'),
       "Course-specific directions work alongside shared descriptions")
assert(render_sprint(sprint, with_lessons: false).include?('aria-label="Sprint directions"'),
       "Directions remain visible before lessons are scheduled")
error = begin
  render_sprint(sprint.merge("direction_include" => "projects/courses/sprint-intro/missing.md"))
  nil
rescue IOError => e
  e
end
assert(error && error.message.include?("projects/courses/sprint-intro/missing.md"),
       "A missing configured include fails explicitly and identifies the path")

puts "PASS: optional sprint directions, placement, rubric points, navigation, shared descriptions, and missing-file failure"
