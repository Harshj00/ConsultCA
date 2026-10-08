# Architecture decisions

- Keep System One's deterministic response validation and safety threshold in `supabase/functions/_shared/system-one-routing.ts`, shared with regression tests, so the browser cannot make or bypass safety decisions.