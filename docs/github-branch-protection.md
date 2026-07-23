# GitHub Branch Protection (manual setup)

Branch protection is configured in the GitHub UI, not in the repository. Use these steps so only code that has passed the **CI** workflow can be merged into `main`.

## Prerequisites

- Repository admin (or owner) access
- The [CI workflow](../.github/workflows/ci.yml) must have run at least once on a pull request so GitHub lists the status check

## Configure protection for `main`

1. Open the repository on GitHub.
2. Go to **Settings** → **Branches**.
3. Under **Branch protection rules**, click **Add branch protection rule** (or **Add classic branch protection rule**).
4. Set **Branch name pattern** to:

   ```text
   main
   ```

## Required settings

Enable the following options:

### Require a pull request before merging

- Check **Require a pull request before merging**
- This prevents direct pushes to `main` and forces changes through a PR

### Require status checks to pass before merging

- Check **Require status checks to pass before merging**
- Check **Require branches to be up to date before merging**
- In the search/status checks list, select the CI job:

  ```text
  Format, Lint, Test & Build
  ```

  GitHub may also show it as `CI / Format, Lint, Test & Build`. Choose the check that belongs to the workflow named **CI** (`.github/workflows/ci.yml`).

  If the check does not appear yet, open a draft PR (or push to a branch) so CI runs once, then return to this page and select it.

### Include administrators (recommended)

- Check **Do not allow bypassing the above settings** (or the equivalent **Include administrators** option, depending on the GitHub UI version)
- This applies the same rules to repository admins

## Optional but useful

- **Require approvals** — at least one approving review before merge
- **Dismiss stale pull request approvals when new commits are pushed**
- **Restrict who can push to matching branches** — leave empty if PRs are the only path to `main`

## What this does _not_ cover

- Azure Static Web Apps deployment stays in its own workflow and is not a merge gate
- Quality checks (format, lint, test, build) run only in **CI**; do not reconfigure branch protection to require the Azure deploy job for merges

## Verify

1. Open a pull request into `main`.
2. Confirm the **CI** workflow runs and the PR shows the **Format, Lint, Test & Build** check.
3. Confirm the merge button stays disabled until that check is green (and the branch is up to date with `main`).
4. After merge, confirm Azure Static Web Apps deploys from `main` via its separate workflow.
