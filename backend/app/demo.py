"""Demo material for the AI Desk screens.

These are *examples of the review surface*, not generated editorial content.
The app stores AI tasks and settings in the database; provider calls are
deliberately not wired up in this scaffold.
"""

TRENDING_TOPICS = [
    {
        "topic": "Nigeria AI policy draft",
        "region": "Nigeria",
        "category": "Technology & AI",
        "momentum": 92,
        "urgency": "High",
        "suggestedHeadline": "What the draft national AI policy changes for Nigerian builders",
    },
    {
        "topic": "AfCFTA implementation rules",
        "region": "Africa",
        "category": "Africa News",
        "momentum": 81,
        "urgency": "High",
        "suggestedHeadline": "AfCFTA's rules are moving from signature to practice",
    },
    {
        "topic": "2027 scholarship deadlines",
        "region": "Nigeria",
        "category": "Education & Opportunities",
        "momentum": 78,
        "urgency": "Medium",
        "suggestedHeadline": "The 2027 scholarship calendar, in one place",
    },
    {
        "topic": "Super Eagles squad list",
        "region": "Nigeria",
        "category": "Sports",
        "momentum": 74,
        "urgency": "High",
        "suggestedHeadline": "Reading the Super Eagles squad for the qualifiers",
    },
    {
        "topic": "Lagos transport fares",
        "region": "Lagos",
        "category": "Nigeria News",
        "momentum": 63,
        "urgency": "Medium",
        "suggestedHeadline": "What the new Lagos fare bands mean for commuters",
    },
    {
        "topic": "Afrobeats stadium tours",
        "region": "Africa",
        "category": "Entertainment",
        "momentum": 58,
        "urgency": "Low",
        "suggestedHeadline": "Afrobeats' next export is a stadium tour",
    },
]

RESEARCH_SOURCES = [
    {
        "domain": "nitda.gov.ng",
        "title": "National AI strategy consultation paper",
        "date": "4 Nov 2026",
        "status": "Confirmed",
        "url": "https://nitda.gov.ng/",
        "note": "Primary government document. Check for the final version before publishing.",
    },
    {
        "domain": "afcfta.org",
        "title": "Protocol on trade in services — implementation note",
        "date": "2 Nov 2026",
        "status": "Confirmed",
        "url": "https://au.int/en/afcfta",
        "note": "Official secretariat publication.",
    },
    {
        "domain": "reuters.com",
        "title": "African startup funding round-up, Q3 2026",
        "date": "28 Oct 2026",
        "status": "Confirmed",
        "url": "https://www.reuters.com/",
        "note": "Wire copy; figures are attributed to the reporting.",
    },
    {
        "domain": "social-post.example",
        "title": "Unverified claim about a new startup fund",
        "date": "9 Nov 2026",
        "status": "Alleged",
        "url": "",
        "note": "Single social post. Do not use without a primary source.",
    },
]

FACT_CHECKS = [
    {
        "claim": "A new $500m fund will be launched for Nigerian AI startups before December.",
        "severity": "danger",
        "note": "No primary source found. The only reference is a social post.",
    },
    {
        "claim": "AfCFTA rules on services take effect in January 2027.",
        "severity": "warning",
        "note": "Two official documents give different commencement dates. Check with the secretariat.",
    },
    {
        "claim": "Nigeria has more than 200 active AI startups.",
        "severity": "info",
        "note": "Figure appears in an industry report; methodology is not public.",
    },
]
