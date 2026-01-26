# Help Text Export Instructions

## Purpose
This document describes the process and context for exporting help text from the AMO-Tools-Desktop project, specifically for PSAT modules and pump calculators, and converting it from HTML to markdown for documentation or intern review.

## Context
- The workspace is the AMO-Tools-Desktop project.
- Help text is typically found in files named `*-help.component.html` within module or calculator folders (e.g., `/psat`, `/calculator/pumps`).
- The goal is to extract all help text, convert it to markdown, and organize it in a folder structure that mirrors the app's organization.
- Images are omitted, but file paths and source locations are tracked for later manual insertion.

## Markdown Formatting Template
- **Header 1:** Assessment Module / Calculator Group (e.g., "Assessment Module - PSAT" or "Calculator Group - Pumps")
- **Header 2:** Assessment Page / Calculator (e.g., "Field Data Help", "Specific Speed Calculator")
- **Header 3:** Sub page component? (Usually not used; help text doesn't know about this)
- **Header 4:** Field Name (e.g., "Flow Rate", "Pump Type")
- **Text:** Help text, tables, and notes. Images omitted. Include original filename and source location at the end.

## Example Markdown Output
```
# Assessment Module - PSAT

## Field Data Help

### Field Name: Flow Rate
Flow Rate represents either the measured or required rate of flow. The Flow Rate value is used by the software to calculate the fluid power and to estimate the optimal pump operating efficiency.

---

**Source: src/app/psat/help-panel/field-data-help/field-data-help.component.html**
```

## Extraction Steps
1. **Locate Help Files:** Search for files matching `*-help.component.html` in the relevant module/calculator folders.
2. **Extract HTML Content:** Read the full content of each help file.
3. **Convert to Markdown:**
   - Remove all HTML tags and remnants.
   - Omit images, but note their original location for later manual insertion.
   - Use the markdown formatting template above.
   - Organize output in a folder structure that mirrors the app (e.g., `/help-documentation/psat/field-data-help.md`).
4. **Save Output:** Place the markdown files in the `/help-documentation` folder at the top level of the workspace, preserving the original organization.

## Notes
- This process is designed for mechanical engineering interns or similar users who need clean, readable documentation.
- The markdown files should be easy to read, with no HTML remnants.
- If new modules or calculators are added, repeat the process for those folders.

---

**Prompt for Future Use:**

> Find all the help text in the [target module or calculator group] and export the HTML to markdown. The files should be organized in the same way that each help file is and in folders by group, calculator, etc., mirroring the app's organization. Usually the files are named ("_____-help.html"). This is for a mechanical engineering intern to read so there must not be remnants of HTML. Use the following formatting:
> - Header 1: Assessment Module / Calculator Group
> - Header 2: Assessment Page / Calculator
> - Header 3: Sub page component? (usually not used)
> - Header 4: Field Name
> - Text: help text, images omitted, original filename and source location
> 
> (See `help-export-instructions.md` for full details.)
