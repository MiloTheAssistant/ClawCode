# ClawCode

Coding agent for the Command Center multi-agent system. Executes routine autonomous implementation tasks delegated by NEO (architecture) and CORNELIUS (execution planning).

---

## What ClawCode Is

ClawCode is the **CLAWCODE** `BUILDER` agent in Command Center. It sits at the bottom of the engineering chain:

```
ELON (orchestrator)
  └── NEO (architecture + technical design)
        └── CORNELIUS (execution plan + rollback)
              └── CLAWCODE (implementation)
                    └── SENTINEL (QA gate)
```

ClawCode handles **routine autonomous coding**. Critical or complex work escalates directly to Claude Code (outside the harness).

---

## Model Lineup

| Scenario | Model |
|----------|-------|
| Routine coding | MiniMax M2.7 (Ollama local) |
| Heavy / large codebase | GPT-OSS 20B (Ollama local) |
| Large-scale cloud task | GPT-OSS 120B (Ollama Pro) |
| Precision / critical | GPT-5.4 Codex (ChatGPT Plus) |

---

## How It Receives Tasks

Tasks arrive from NEO or CORNELIUS via the OpenClaw / PaperClip orchestration layer. ClawCode:

1. Loads 2Brain wiki for relevant codebase patterns
2. Reads the target repo's `CLAUDE.md`
3. Confirms the execution plan is clear and reversible
4. Implements and delivers a `CODE_PACKAGE` to SENTINEL

---

## Governance

- Full rules: `~/repos/OpenClawMaster/AGENTS.md`
- Model routing: `~/repos/OpenClawMaster/config/models.yaml`
- Operating framework: `~/repos/OpenClawMaster/GotchaFramework.md`
- This repo's role definition: `CLAUDE.md`
