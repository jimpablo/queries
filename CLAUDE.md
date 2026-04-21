# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

E-commerce data utilities project: TypeScript query functions over a SQLite database, designed to demonstrate Claude Code hooks and AI-assisted development workflows.

## Development Commands

```bash
npm run setup          # Install dependencies + run init script
npm run sdk            # Run sdk.ts via tsx (Claude Agent SDK playground)
```

To run a specific query file directly:

```bash
npx tsx src/queries/customer_queries.ts
```

To type-check without emitting:

```bash
npx tsc --noEmit
```

## Hooks (Active in Claude Code)

Configure by copying `.claude/settings.example.json` → `.claude/settings.json`.

| Hook                            | Trigger                           | Behavior                                                                                                       |
| ------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `hooks/read_hook.js`            | PreToolUse: Read/Grep             | Blocks access to `.env` files; exits with code 2 if path contains `.env`                                       |
| `hooks/query_hook.js`           | PreToolUse: Write/Edit/MultiEdit  | Calls Claude Agent SDK to scan `src/queries/` for duplicate functions; blocks with exit 2 if duplication found |
| `hooks/tsc.js`                  | PostToolUse: Write/Edit/MultiEdit | Runs full TypeScript type-check via `tsconfig.json`; blocks with exit 2 on errors                              |
| `npx prettier --write` (inline) | PostToolUse: Write/Edit/MultiEdit | Inline command in settings; auto-formats the modified file                                                     |

The `query_hook.js` currently has an early `process.exit(0)` at line 9 — the duplication check is disabled by default and must be enabled by removing that line.

## Architecture

### Database Layer

- `src/schema.ts` — all `CREATE TABLE` statements; 12 tables covering the full e-commerce domain
- `src/main.ts` — opens the SQLite connection and initializes the schema
- All queries accept a `Database` instance (from the `sqlite` package) as first argument

### Query Modules (`src/queries/`)

All query functions follow a consistent pattern: `export async function <name>(db: Database, ...params): Promise<InterfaceType>`. Each file exports both the query functions and the TypeScript interfaces for their return types.

| File                   | Domain                                                            |
| ---------------------- | ----------------------------------------------------------------- |
| `customer_queries.ts`  | Customer lookup, profiles, segments, review summaries             |
| `order_queries.ts`     | Order details, status filtering, date ranges, high-value orders   |
| `product_queries.ts`   | Catalog, SKU lookup, low-stock detection, reorder needs           |
| `inventory_queries.ts` | Warehouse availability, transfer recommendations, inventory value |
| `promotion_queries.ts` | Active promos, eligibility checks, expiry tracking, ROI           |
| `analytics_queries.ts` | LTV, segment metrics, repeat customers, trending products         |
| `review_queries.ts`    | Ratings, verified purchases, helpful counts                       |
| `shipping_queries.ts`  | Address management, delivery delays, cost analysis by state       |

### SQL Patterns

- Single row → `db.get()`, multiple rows → `db.all()`, DDL → `db.exec()`
- All user-supplied values use `?` placeholders — never inline
- Date arithmetic uses `julianday()` and `datetime('now', '-N days')`
- Complex analytics use CTEs; array-like results use `GROUP_CONCAT()`

### Claude Agent SDK (`sdk.ts`)

Thin wrapper showing how to call `query()` from `@anthropic-ai/claude-agent-sdk`. Run with `npm run sdk`. Used internally by `query_hook.js` to analyze proposed changes.

## Critical Guidance

- All database queries must be written in `src/queries/`
- Each query function must export a TypeScript interface matching its return shape — avoid `Promise<any>`
- Do not add a new query function if an existing one can be extended with an optional parameter
