# Pull Request Template

## Checklist
- Variable, function, and class names are descriptive
- Code leverages existing architecture, helper methods, and shared modules when applicable
- Development artifacts such as console logs, test values, and comments have been removed
- All Copilot, Claude Code, or other LLM implementations have been reviewed as if contributed by another developer
- UI changes have been manually tested for usability and appearance
- This PR references the related issue number (if applicable), ex. issue -> `#0000`
- Suite-facing changes link the Suite issue/PR and record the exact package version tested

## Description
- **For development team**: Optional. Update the issue with a comment, if necessary.
- **For open source contributors**: The PR description clearly explains the purpose and scope of the changes

## MEASUR-Tools-Suite Coordination

Complete this section for Suite-facing changes, or write `Not applicable`.

- Desktop issue:
- Suite issue:
- Suite pull request:
- Change classification: additive API / breaking API / behavioral / default data / declaration-only / packaging
- Compatibility decision and approval:
- Suite beta version tested:
- Approved final Suite version:
- Root and process-flow dependency pins aligned: Yes / No / Not applicable
- Affected wrappers, enum/unit/percentage conversions, models, reports, saved data, or default data:
- Web/Electron WASM loading affected: Yes / No

### Suite Verification

- [ ] Installed Suite declarations inspected
- [ ] Wrapper typecheck and affected tests passed
- [ ] Regression coverage run when calculation behavior changed
- [ ] Web runtime checked when applicable
- [ ] Electron runtime checked when applicable
- [ ] No customer data, sensitive assessment inputs, credentials, or private operational details are included

---
