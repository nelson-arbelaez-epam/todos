# todos

## Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

Before opening a pull request, run the following command to validate your changes locally:

```bash
yarn biome check .
```

To auto-fix formatting issues:

```bash
yarn format
```

To run lint only:

```bash
yarn lint
```

> **Note:** The `biome check` CI job is a required status check. PRs cannot be merged until it passes.
