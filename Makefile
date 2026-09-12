PROJ := montereybayevents.com

.DEFAULT_GOAL := help

# Verify parent Makefile exists — this project is part of the sites/ workspace.
ifeq ($(wildcard ../Makefile),)
$(error This Makefile is meant to be run inside the sites/ workspace. Parent Makefile not found.)
endif

# Explicit targets, declared BEFORE the catch-all below so they win over it.
# These run pnpm directly rather than forwarding to the parent, because they are
# this project's own tooling and the central builder knows nothing about them.
# Run them inside the sites1 container, same as `make test`:
#   docker exec -w /usr/src/app/montereybayevents.com <container> make og
og:                ## Re-render the Open Graph cards into public/og/ (commit the result)
	pnpm og

og-check:          ## Fail if any committed OG card is stale or missing
	pnpm og:check

.PHONY: og og-check

# Forward every target to the parent Makefile with proj set to this project.
# `make buildsh` (parent) drops you into the dev container; `make run` etc.
# delegate to the central builder repo (~/work/projects/builder/) under the hood.
%:
	$(MAKE) -C .. $@ proj=$(PROJ)
