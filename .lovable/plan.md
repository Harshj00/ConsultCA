# TypeSafe System One routing and telemetry

## Goal
Integrate Jev as a secure pre-generation router for the existing CA assistant and show measured routing telemetry in the signed-in workspace.

## Implementation
- Call the workspace Lovable AI Gateway's native `/v1/systemone` endpoint with the server-held key and exact `typesafe/jev-latest` model; do not use OpenRouter.
- Validate the existing request and preserve its authentication and usage checks. Validate Jev's typed response before using it; block only when the harmful-intent probability is above 0.85, otherwise escalate to the generative answer.
- Keep legal answers grounded in the existing assistant rather than inventing a local “cache” or returning canned tax guidance. Show measured Jev and generation latency, route, confidence, and complexity; represent routing cost honestly instead of claiming savings when generation still runs.
- Use the mandated default `openai/gpt-6-astra` for generation via the documented streaming Responses API, with safe gateway error handling and route metadata in CORS-exposed response headers.
- Add a collapsible workspace telemetry panel and real in-progress, blocked, and routed states. Track actual request metrics (no mocked latency values); estimate token costs only from available usage/measurements and label them estimates.
- Resolve the existing Recharts 3 type incompatibilities surfaced by the current build so the requested latency chart can render and the project compiles.

## Verification
- Add focused tests for the harmful-intent threshold and Jev answer validation where the existing test setup permits.
- Exercise the relevant edge function and dashboard path where available, run the focused tests, and check the preview build log.
