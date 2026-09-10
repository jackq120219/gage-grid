# Gage Grid data methodology

Gage Grid separates **simulated capacity screening** from **live or public evidence**.

- `data/pilot-sites-v2.json` identifies the 12 Midwest pilot nodes and their nearby USGS monitoring locations. Coordinates are city-area pilot approximations, not parcel geocodes.
- `data/project-presets-v2.json` mirrors the editable screening defaults used by the prototype. They are not engineering design loads.
- `data/public-source-registry-v1.json` documents authoritative federal/state sources and likely utility candidates. Registry presence is not proof of service territory or capacity.
- `data/evidence-contract-v1.json` defines the evidence states. Only an explicit written utility commitment tied to the exact project and parcel is allowed to represent serviceability.
- `/api/usgs-water` returns observation age, freshness status and provisional-state metadata in addition to the raw USGS observation.

Automated validation runs in `.github/workflows/quality-gate-v1.yml`; live production checks run daily in `.github/workflows/production-smoke-v1.yml`.
