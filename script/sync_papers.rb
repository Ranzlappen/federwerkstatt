#!/usr/bin/env ruby
# frozen_string_literal: true

# Scaffold the per-PDF Jekyll pages and metadata for any PDF in assets/papers/
# that isn't wired up yet. Two things get scaffolded:
#
#   1. The `papers` collection stubs in _papers/ — two tiny files per PDF: the
#      landing page (_papers/<slug>.md → /papers/<slug>/) and the PDF.js reader
#      (_papers/<slug>-read.md → /papers/<slug>/read/). These are what give each
#      PDF its own page; they carry only the filename + permalink.
#   2. A ready-to-fill metadata stub in _data/papers.yml (with the date pre-parsed
#      from a YYYY-MM-DD filename prefix). All human metadata lives here, keyed by
#      the exact PDF filename, so it stays single-sourced.
#
# Existing files and the data file's leading comments are left untouched.
#
# Usage:  ruby script/sync_papers.rb
# Exits 0 always; prints what it created (if anything) to stdout.

require "yaml"
require "date"

ROOT           = File.expand_path("..", __dir__)
PAPERS_DIR     = File.join(ROOT, "assets", "papers")
DATA_FILE      = File.join(ROOT, "_data", "papers.yml")
COLLECTION_DIR = File.join(ROOT, "_papers")
DEFAULT_AUTHOR = "Udo Bröring"

# --- gather the PDFs on disk -------------------------------------------------
pdfs = Dir.children(PAPERS_DIR)
          .select { |f| File.extname(f).downcase == ".pdf" }
          .sort

if pdfs.empty?
  puts "No PDFs in assets/papers/ — nothing to do."
  exit 0
end

# Slug = slugify(PDF basename), matching the permalinks in the _papers/ stubs
# (Jekyll's default slugify keeps stop-words; German umlauts are transliterated).
def slugify(name)
  s = File.basename(name, ".*").sub(/\A\d{4}-\d{2}-\d{2}-/, "")
  s = s.gsub("ö", "oe").gsub("ä", "ae").gsub("ü", "ue")
       .gsub("Ö", "Oe").gsub("Ä", "Ae").gsub("Ü", "Ue").gsub("ß", "ss")
  s.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-+|-+\z/, "")
end

# --- scaffold the collection stubs (landing + reader) ------------------------
Dir.mkdir(COLLECTION_DIR) unless Dir.exist?(COLLECTION_DIR)
created_stubs = []
pdfs.each do |name|
  slug = slugify(name)
  landing = File.join(COLLECTION_DIR, "#{slug}.md")
  reader  = File.join(COLLECTION_DIR, "#{slug}-read.md")
  unless File.exist?(landing)
    File.write(landing, <<~MD)
      ---
      pdf: "#{name}"
      slug: #{slug}
      permalink: /papers/#{slug}/
      ---
    MD
    created_stubs << "_papers/#{slug}.md"
  end
  unless File.exist?(reader)
    File.write(reader, <<~MD)
      ---
      pdf: "#{name}"
      slug: #{slug}
      layout: paper-reader
      permalink: /papers/#{slug}/read/
      ---
    MD
    created_stubs << "_papers/#{slug}-read.md"
  end
end
unless created_stubs.empty?
  puts "Created #{created_stubs.size} collection stub(s):"
  created_stubs.each { |s| puts "  + #{s}" }
end

# --- read the keys already present in papers.yml -----------------------------
raw = File.exist?(DATA_FILE) ? File.read(DATA_FILE) : ""
existing =
  begin
    parsed = YAML.safe_load(raw, permitted_classes: [Date], aliases: false)
    parsed.is_a?(Hash) ? parsed.keys : []
  rescue Psych::SyntaxError => e
    warn "Could not parse #{DATA_FILE}: #{e.message}"
    exit 1
  end

missing = pdfs - existing
if missing.empty?
  puts "papers.yml already has an entry for every PDF — nothing to add."
  exit 0
end

# --- build a stub for each missing PDF ---------------------------------------
def derive_date(filename)
  m = filename.match(/\A(\d{4})-(\d{2})-(\d{2})-/)
  return nil unless m
  Date.new(m[1].to_i, m[2].to_i, m[3].to_i) rescue nil
end

def derive_title(filename)
  base = File.basename(filename, ".*")
  base = base.sub(/\A\d{4}-\d{2}-\d{2}-/, "")        # drop a date prefix
  base.tr("-_", "  ").split.map(&:capitalize).join(" ")
end

# Double-quote a YAML scalar while keeping UTF-8 intact (String#inspect would
# escape "ö" to "ö"); only backslash and double-quote need escaping.
def yq(str)
  %("#{str.gsub('\\', '\\\\\\\\').gsub('"', '\\"')}")
end

stubs = missing.map do |name|
  date  = derive_date(name)
  title = derive_title(name)
  lines = []
  lines << %(#{yq(name)}:)
  lines << %(  title: #{yq(title)}        # TODO: confirm/replace title)
  lines << %(  authors: #{yq(DEFAULT_AUTHOR)})
  lines << %(  date: #{date.iso8601})          if date
  lines << %(  description: >-)
  lines << %(    TODO: add an abstract or summary for this document.)
  lines.join("\n")
end

addition = "\n" + stubs.join("\n\n") + "\n"
addition = addition.sub(/\A\n/, "") if raw.empty? || raw.end_with?("\n\n")
File.open(DATA_FILE, "a") { |f| f.write(addition) }

puts "Added #{missing.size} stub entr#{missing.size == 1 ? "y" : "ies"} to _data/papers.yml:"
missing.each { |n| puts "  + #{n}" }
