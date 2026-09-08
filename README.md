# Gage Grid

Gage Grid is an industrial infrastructure decision-intelligence prototype built around one question: **can a specific site support a specific industrial project before meaningful diligence capital is committed?**

It is intentionally narrower than a general parcel, GIS, zoning, or construction-feasibility platform. The product focuses on infrastructure **serviceability**: usable capacity, timing, evidence quality, redundancy, uncertainty, bottlenecks, and the next diligence action.

## V3 decision workspace

The current prototype includes:

- A project/site feasibility desk covering power, water, wastewater, gas, fiber, power redundancy, required online date, risk posture, expected load growth, and optional pre-development capital exposure.
- Project presets for data centers, advanced manufacturing, semiconductor/high-spec fabs, food and beverage processing, cold storage, battery manufacturing, distribution, and custom industrial loads.
- Risk-adjusted usable-capacity calculations that discount raw headroom according to evidence strength and user risk posture.
- A feasibility score **plus an uncertainty range** so modeled or lower-confidence records do not create false precision.
- Base-case and stress-case analysis, including faster delivery and higher-growth scenarios.
- Automatic first-bottleneck detection and quantified shortfall analysis that explains what additional capacity or project rescoping would be needed to reach modeled coverage.
- An ordered diligence path tailored to the limiting infrastructure system.
- Project-first reverse screening that ranks all 12 pilot nodes against the same project requirements.
- Three-site side-by-side comparison across feasibility, uncertainty, timing, bottleneck, and residual capacity buffers.
- A 12-node Midwest pilot portfolio with 60 simulated infrastructure records.
- Searchable/filterable registry, evidence and confidence fields, lead-time assumptions, record details, and filtered CSV export.
- Change-detection examples intended to evolve into alerts that identify when a prior site decision has become stale.
- Local saved decisions, scenario reopening, shareable scenario URLs, ranking CSV export, text diligence memo export, and print/PDF-friendly reports.
- Responsive desktop/mobile design, crawlability files, social metadata, and static security headers.

## Product boundary

Gage Grid is designed to complement—not replace—parcel mapping, zoning research, engineering studies, utility load studies, legal diligence, or formal service commitments. Its job is to help a developer, investor, site selector, or operator decide **where to spend those diligence dollars first and what to ask next**.

## Production data standard

Every production infrastructure record should carry at minimum:

- Source URI or source document
- Retrieval date and effective date
- Utility/service territory
- Infrastructure system and unit
- Raw/nameplate capacity when relevant
- Estimated usable headroom
- Method used to derive usable headroom
- Evidence status (for example verified, reported, or modeled)
- Confidence score / uncertainty treatment
- Indicative lead time and key upgrade assumptions
- Redundancy / topology information where relevant
- Known downstream or collection constraints
- Latest change event
- Utility verification status

No production record should be presented as a utility commitment or engineering determination unless it actually is one and the underlying documentation supports that status.

## Current status

V3 is a simulated Midwest pilot intended to demonstrate product behavior and decision logic. The next major product step is replacing simulated records with a source-backed data pipeline and parcel/service-territory resolution while preserving the narrow focus on infrastructure serviceability and decision quality.
