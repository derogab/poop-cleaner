# Agent Guidelines

## Purpose
- Use this file as operating guidance, not as a substitute for reading the codebase.
- Prefer lightweight discovery over assumptions: inspect this project, confirm how the bot starts, how it is configured, and how it is validated before making changes.
- Keep edits scoped to the user's request and preserve existing conventions unless there is a clear reason to improve them.

## Project shape
- This project is a small Telegram moderation bot centered on a simple idea: group members can collectively flag unwanted messages through reactions.
- It is a single-purpose, stateful application rather than a broad platform, so behavior is usually easier to understand by tracing the request flow end to end.
- Most changes will involve command handling, reaction-driven moderation logic, configuration, localized user-facing text, or runtime/deployment wiring.
- Treat it as a compact codebase where directness is usually better than abstraction.

## How to understand the project
- Start with the human-oriented documentation to learn product intent, setup expectations, and deployment notes.
- Inspect the Node package manifest and scripts to identify supported local workflows.
- Read the runtime entrypoint and follow the execution path into the modules that handle commands, reactions, persistence, and user-facing text.
- Check the CI workflow to see which build path actually gates pull requests and releases.
- When behavior depends on Telegram or Redis, confirm how the integration is wired before changing logic.

## How to make changes safely
- Match the existing language style, module system, formatting, naming, and file organization used by the surrounding code.
- Prefer small, direct changes over broad refactors.
- Keep code readable on its own, but add clear comments or docblocks for non-obvious logic so future readers can follow the intent without rediscovering it.
- If you change user-facing behavior, trace where strings, Markdown formatting, and locale-specific content are defined and keep them consistent.
- If you add or change configuration, update the example environment setup and any human documentation that explains how to use it.
- Avoid introducing new dependencies, patterns, or abstractions unless the current code clearly needs them.

## Validation workflow
- Run the most relevant local verification commands exposed by the project scripts.
- When dependencies change in `package.json`, run `npm install` so the lockfile stays in sync.
- Use the CI workflow definition as the source of truth for required automated checks.
- If the nominal test command is a placeholder or intentionally failing, use the next most meaningful build or packaging check instead.
- For changes involving containers, deployment artifacts, or release packaging, run the same build path used by CI when practical.
- When external services are required to fully validate behavior, state what you verified locally and what still depends on that service.

## Configuration and secrets
- Discover required and optional environment variables from the sample environment files, startup code, and docs.
- Never commit populated secret files, real tokens, private addresses, or credentials.
- Treat changes to configuration shape as user-facing changes that require synchronized documentation updates.

## Documentation upkeep
- When something changes in the project, check whether related documentation should change too.
- Review both human-facing and agent-facing documentation whenever behavior, configuration, workflows, or operational expectations change.
- Keep nearby documents aligned rather than assuming a code change is self-explanatory.

## Integration awareness
- Verify assumptions about Telegram behavior from the code paths that handle incoming events and outgoing responses.
- Preserve any response formatting requirements enforced by the Telegram client library or API contract.
- Be cautious with features that depend on bot permissions, reaction updates, message formats, or Redis availability; document those dependencies when relevant.

## Collaboration expectations
- Explain changes in terms of what was changed, where the behavior lives, and why the change fits the existing codebase.
- Mention the validation you performed and call out any checks you could not run.
- If a request would benefit from follow-up work, suggest only the most natural next steps.
