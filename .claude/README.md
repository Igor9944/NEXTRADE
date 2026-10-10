# NEXTRADE Engineering Agent - Setup Complete

## What Has Been Created

1. **CLAUDE.md** - The main system instructions for the NEXTRADE Engineering Agent
   - Located at: `C:\Users\mmeca\NEXTRADE\CLAUDE.md`
   - Contains complete system prompt with 15 sections covering identity, mission, rules, phases, and success criteria

2. **Directory Structure**
   - `.claude/scripts/` - Contains placeholder scripts for audit and repair commands
   - `.claude/hooks/` - Available for future hook implementations
   - `.claude/agents/` - Available for future specialized sub-agent configurations

3. **Placeholder Scripts**
   - `.claude/scripts/audit.js` - Basic audit command placeholder
   - `.claude/scripts/repair.js` - Basic repair command placeholder

## How to Use the Agent

To activate the NEXTRADE Engineering Agent in Claude Code:

1. **Ensure you're in the project root**: `C:\Users\mmeca\NEXTRADE`
2. **Start a new conversation** or refresh the current one
3. **The agent will automatically load** the instructions from CLAUDE.md

## Initial Usage Recommendation

As specified in the documentation, begin with an audit-only phase:

```
Lis intégralement les instructions de `CLAUDE.md` et applique-les au dépôt NEXTRADE.

Je veux réaliser un audit technique approfondi du projet existant.

Pour cette première phase, travaille en MODE AUDIT STRICT : inspection et diagnostic uniquement, sans modifier les fichiers du projet, sans installer de dépendances, sans lancer de migration, sans pousser de commit et sans déployer.
```

## Next Steps

1. **Run an initial audit** to assess the current state of the NEXTRADE project
2. **Review the audit report** to understand identified issues and their priorities
3. **Begin incremental corrections** starting with high-priority, low-risk issues
4. **Always run validation tests** after making changes
5. **Iterate** through the audit-fix-validate cycle

## Important Notes

- The agent is designed to work iteratively: understand → reproduce → plan → fix → test → control → document
- Never deploy to production without explicit authorization
- Always preserve existing work and create backups when making significant changes
- The agent combines multiple expert roles: architect, full-stack engineer, security expert, QA engineer, DevOps engineer, performance engineer, and technical auditor

## Current Project State (from earlier analysis)

- **Frontend**: React/Vite with Playwright E2E tests
- **Backend**: Node.js/Express/TypeScript with PostgreSQL
- **Database**: PostgreSQL service available, test database `nextrade_test` already created with required marker
- **Environment**: Windows with Node.js v24.21.0, npm v11.19.0 available
- **Missing Tools**: PostgreSQL CLI (`psql`) and Docker not found in PATH, but PostgreSQL binaries available at `C:\Program Files\PostgreSQL\18\bin\`