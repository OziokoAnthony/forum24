"""Idempotent demo seed.

Run it directly to create tables and content without Alembic (development only):

    python -m app.seed            # seed if the database is empty
    python -m app.seed --reset    # drop and recreate every table, then seed
"""

from __future__ import annotations

import argparse
import asyncio
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from .constants import DEFAULT_AI_FEATURES
from .db import Base, SessionLocal, engine
from .models import (
    AdPlacement,
    AiSetting,
    AiTask,
    Article,
    AuditLog,
    Category,
    Comment,
    Document,
    NewsletterSubscriber,
    Tag,
    User,
    Video,
)
from .schemas.common import slugify
from .security import hash_password

DEMO_PASSWORD = "Forum24!demo"

CATEGORIES = [
    ("news", "Nigeria News", "National developments, public affairs and local reporting."),
    ("africa", "Africa News", "Economy, politics and society across the continent."),
    ("business", "Business & Finance", "Entrepreneurship, markets and investment education."),
    ("tech", "Technology & AI", "AI, software, gadgets and digital innovation."),
    ("education", "Education & Opportunities", "Scholarships, admissions, jobs, grants and exams."),
    ("sports", "Sports", "Football, athletics, competitions and analysis."),
    ("entertainment", "Entertainment", "Celebrity, music, movies and events."),
    ("lifestyle", "Lifestyle & Culture", "Relationships, fashion, food, travel and culture."),
    ("world", "World News", "International developments and global affairs."),
    ("tutorials", "Tutorials & Guides", "Practical technology, business and educational guides."),
    ("education-technology", "Education & Technology", "Learning resources at the intersection of teaching and technology."),
]

# email, name, role, title
USERS = [
    ("admin@forum24.example", "Ifeoma Adebayo", "admin", "Editor-in-chief"),
    ("editor@forum24.example", "Emeka Nwosu", "editor", "Managing Editor"),
    ("reviewer@forum24.example", "Zainab Yusuf", "reviewer", "Standards Editor"),
    ("author@forum24.example", "Adaeze Okonkwo", "author", "Technology Editor"),
    ("tunde@forum24.example", "Tunde Bakare", "author", "Africa Correspondent"),
    ("ngozi@forum24.example", "Ngozi Eze", "author", "Education Reporter"),
    ("chiamaka@forum24.example", "Chiamaka Obi", "author", "Business Editor"),
    ("femi@forum24.example", "Femi Adeyemi", "author", "Culture Writer"),
    ("ibrahim@forum24.example", "Ibrahim Musa", "author", "Sports Analyst"),
    ("halima@forum24.example", "Halima Bello", "author", "News Reporter"),
    ("sarah@forum24.example", "Sarah Mensah", "author", "Climate Correspondent"),
]


def dt(day: int, hour: int = 9, minute: int = 0, month: int = 11) -> datetime:
    return datetime(2026, month, day, hour, minute, tzinfo=timezone.utc)


def long_body(topic: str) -> list[dict]:
    return [
        {
            "type": "p",
            "text": (
                f"{topic} is moving from a talking point to a working reality across Nigeria and the wider "
                "continent. The shift is visible in boardrooms, on university campuses and in the small teams "
                "shipping products from co-working spaces in Lagos, Abuja and Kigali."
            ),
        },
        {"type": "h2", "text": "Why this moment matters"},
        {
            "type": "p",
            "text": (
                "Three forces are converging: cheaper cloud infrastructure, a young and connected population, "
                "and a wave of founders who are building for African conditions rather than adapting products "
                "designed elsewhere. The result is a market that is finally beginning to reward local context."
            ),
        },
        {
            "type": "p",
            "text": (
                "Investors are paying attention, but the capital is only part of the story. The more durable "
                "change is operational: teams are learning to ship faster, measure honestly and treat "
                "distribution as a first-class problem."
            ),
        },
        {
            "type": "quote",
            "text": (
                "The opportunity is not to copy the last decade of Silicon Valley. It is to solve the problems "
                "that are specific to how Africa lives, works and trades."
            ),
        },
        {"type": "h2", "text": "What still stands in the way"},
        {
            "type": "list",
            "items": [
                "Payment rails that still fail at the edges, especially across borders.",
                "A skills gap that is narrowing but not fast enough for demand.",
                "Regulatory uncertainty that makes long-term planning difficult.",
                "Access to patient capital for founders outside the major hubs.",
            ],
        },
        {
            "type": "p",
            "text": (
                "None of these problems is unsolvable. What they require is a longer view: infrastructure that "
                "compounds, institutions that keep their word, and a media ecosystem that reports on the work "
                "honestly rather than chasing the loudest headline."
            ),
        },
        {"type": "h2", "text": "What happens next"},
        {
            "type": "p",
            "text": (
                "Over the next two years, expect consolidation in crowded categories and quiet breakthroughs in "
                "unglamorous ones — logistics, compliance, health records, education delivery. The companies that "
                "win will be the ones that treat trust as a product feature rather than a marketing line."
            ),
        },
    ]


# slug, title, standfirst, category, author email, published, reading time, views, cover, tags, reviewer, featured, trending
ARTICLES = [
    (
        "nigeria-ai-startups-african-infrastructure",
        "Nigeria’s AI startups are quietly building the next wave of African infrastructure",
        "From Lagos to Kigali, a new generation of founders is turning language, payments and logistics into products built for the continent first.",
        "tech",
        "author@forum24.example",
        dt(11, 7, 30),
        6,
        12480,
        0,
        ["AI", "Startups", "Nigeria", "Infrastructure"],
        "editor@forum24.example",
        True,
        True,
        "African AI infrastructure",
    ),
    (
        "afcfta-new-phase-intra-african-trade",
        "AfCFTA enters a new phase as intra-African trade rules tighten",
        "The agreement is moving from signature to implementation, and businesses are discovering that the details matter more than the headline.",
        "africa",
        "tunde@forum24.example",
        dt(11, 6, 15),
        5,
        8320,
        1,
        ["AfCFTA", "Trade", "Policy"],
        None,
        False,
        True,
        "Intra-African trade",
    ),
    (
        "2027-scholarship-round-opens",
        "2027 scholarship round opens for Nigerian undergraduates",
        "Applications are open for federal and state scholarships, with new deadlines and a simplified document checklist.",
        "education",
        "ngozi@forum24.example",
        dt(10, 8, 40),
        4,
        21040,
        2,
        ["Scholarships", "Education", "Students"],
        "reviewer@forum24.example",
        False,
        True,
        "The 2027 scholarship cycle",
    ),
    (
        "fintechs-beyond-lagos-growth",
        "Why Nigeria’s fintechs are looking beyond Lagos for growth",
        "The next million customers are in Kano, Aba and Ibadan. The products that reach them will look different from the ones that won the first wave.",
        "business",
        "chiamaka@forum24.example",
        dt(10, 7, 5),
        8,
        9780,
        3,
        ["Fintech", "Payments", "Growth"],
        None,
        False,
        False,
        "Fintech expansion outside Lagos",
    ),
    (
        "afrobeats-stadium-tour-export",
        "Afrobeats’ next export is a stadium tour, not a single",
        "The genre has already conquered streaming. The harder test is filling rooms in cities where the audience is still being built.",
        "entertainment",
        "femi@forum24.example",
        dt(10, 6, 20),
        5,
        15620,
        4,
        ["Afrobeats", "Music", "Live events"],
        None,
        False,
        False,
        "Afrobeats live touring",
    ),
    (
        "super-eagles-rebuild-midfield",
        "The Super Eagles rebuild starts with the midfield",
        "A younger core is emerging, but the balance between control and transition is still the team’s unresolved question.",
        "sports",
        "ibrahim@forum24.example",
        dt(10, 5, 45),
        4,
        11090,
        5,
        ["Football", "Super Eagles", "Analysis"],
        None,
        False,
        False,
        "The Super Eagles rebuild",
    ),
    (
        "lagos-rail-line-commuter-numbers",
        "Lagos rail line sees record commuter numbers in first full quarter",
        "Ridership is beating early projections, but last-mile connections remain the difference between a successful line and a usable network.",
        "news",
        "halima@forum24.example",
        dt(9, 9, 10),
        3,
        6410,
        1,
        ["Lagos", "Transport", "Infrastructure"],
        None,
        False,
        False,
        "Lagos rail ridership",
    ),
    (
        "climate-finance-african-cities",
        "Climate finance is arriving in African cities — slowly",
        "Municipal governments are learning to package projects that global funds can actually finance. The learning curve is steep.",
        "world",
        "sarah@forum24.example",
        dt(9, 8, 0),
        7,
        4890,
        0,
        ["Climate", "Finance", "Cities"],
        None,
        False,
        False,
        "Climate finance in African cities",
    ),
]

DRAFTS = [
    (
        "what-the-draft-ai-policy-changes",
        "What the draft national AI policy changes for Nigerian builders",
        "A working look at the consultation paper, the parts that are settled and the parts that are still open.",
        "tech",
        "editor@forum24.example",
        "Pending Review",
        True,
    ),
    (
        "reading-the-super-eagles-squad",
        "Reading the Super Eagles squad for the qualifiers",
        "Notes on the call-ups, the omissions and the shape the team is likely to play.",
        "sports",
        "ibrahim@forum24.example",
        "Draft",
        True,
    ),
]

DOCUMENTS = [
    (
        "complete-guide-web-development",
        "Complete Guide to Web Development",
        "A practical introduction to HTML, CSS, JavaScript and deployment, written for beginners in Nigeria and across Africa.",
        "PDF",
        4_718_592,
        24,
        "education-technology",
        1204,
        dt(2),
        0,
        "FORUM24 Learning",
        "Free for personal use",
        "1.2",
        True,
    ),
    (
        "beginners-guide-python",
        "Beginner’s Guide to Python",
        "Variables, loops, functions and your first small project — with exercises after every chapter.",
        "PDF",
        2_202_010,
        38,
        "tech",
        2870,
        dt(28, month=10),
        1,
        "FORUM24 Learning",
        "Free for personal use",
        "1.0",
        True,
    ),
    (
        "cv-writing-for-graduates",
        "CV Writing for Graduates",
        "A short, practical workbook for first-job applicants, including three annotated CV examples.",
        "DOCX",
        491_520,
        12,
        "education",
        4310,
        dt(20, month=10),
        2,
        "FORUM24 Careers",
        "Free to share",
        "2.0",
        False,
    ),
    (
        "digital-marketing-basics",
        "Digital Marketing Basics",
        "How small businesses can use search, social and email without wasting money on the wrong channels.",
        "PDF",
        3_565_158,
        31,
        "business",
        1980,
        dt(14, month=10),
        3,
        "FORUM24 Business",
        "Free for personal use",
        "1.1",
        True,
    ),
    (
        "ai-for-small-business",
        "AI for Small Business",
        "A plain-language deck on where AI saves time today, and where it still needs a human in the loop.",
        "PPTX",
        7_130_317,
        42,
        "tech",
        760,
        dt(8, month=10),
        4,
        "FORUM24 Learning",
        "Attribution required",
        "1.0",
        False,
    ),
    (
        "study-skills-handbook",
        "Study Skills Handbook",
        "Note-taking, revision planning and exam preparation techniques for secondary and university students.",
        "PDF",
        1_992_294,
        18,
        "education",
        3220,
        dt(1, month=10),
        5,
        "FORUM24 Learning",
        "Free to share",
        "1.3",
        False,
    ),
]

VIDEOS = [
    (
        "introduction-to-artificial-intelligence",
        "Introduction to Artificial Intelligence",
        "What AI actually is, how large language models work, and where the opportunities are for African builders.",
        "YouTube",
        872,
        8410,
        "tech",
        dt(9, 11),
        0,
        True,
        [
            {"at": "00:00", "label": "What AI actually is"},
            {"at": "03:10", "label": "How language models work"},
            {"at": "09:45", "label": "Where African builders can start"},
        ],
        [
            "Artificial intelligence is a label for a family of methods, not a single product. Most of what you meet today is pattern recognition at scale.",
            "A language model predicts the next token from the context it was given. It does not look anything up unless you give it something to look at.",
            "The practical opportunity for builders is not a better chatbot. It is taking a slow, repetitive task inside a real business and making it fast.",
        ],
    ),
    (
        "prompting-for-beginners",
        "Prompting for Beginners",
        "A calm, practical walkthrough of writing prompts that produce useful, checkable output.",
        "Vimeo",
        664,
        5120,
        "tech",
        dt(7, 10),
        1,
        True,
        [
            {"at": "00:00", "label": "Why most prompts fail"},
            {"at": "02:40", "label": "A structure that works"},
            {"at": "07:15", "label": "Checking the output"},
        ],
        [
            "A prompt is a brief. If a colleague could not act on it, neither can the model.",
            "Say what you want, who it is for, what it must include, and what it must leave out. Then give one example of a good answer.",
            "Never publish a model answer you have not checked. Ask it for its sources, then open them.",
        ],
    ),
    (
        "build-your-first-api",
        "Build Your First API",
        "From an empty folder to a working FastAPI endpoint with validation and tests.",
        "Uploaded",
        1100,
        3980,
        "tutorials",
        dt(4, 9),
        2,
        True,
        [
            {"at": "00:00", "label": "Set up the project"},
            {"at": "05:30", "label": "Your first endpoint"},
            {"at": "12:10", "label": "Validation and tests"},
        ],
        [
            "We start from an empty folder, create a virtual environment, and install FastAPI and Uvicorn.",
            "The first endpoint returns a list. The second accepts input, which is where validation starts to matter.",
            "Tests are not extra credit. They are how you find out that the endpoint still works after your next change.",
        ],
    ),
    (
        "ai-tools-for-small-business",
        "AI Tools for Small Business",
        "Three workflows that save a small team real hours each week — and two that are not worth it yet.",
        "YouTube",
        587,
        6240,
        "business",
        dt(2, 8),
        3,
        True,
        [
            {"at": "00:00", "label": "Three workflows worth automating"},
            {"at": "03:20", "label": "Two that are not worth it yet"},
            {"at": "06:40", "label": "What it actually costs"},
        ],
        [
            "The three workflows that pay off first are replies to common questions, first drafts of routine documents, and tidying messy spreadsheets.",
            "The two that are not ready are anything with money moving automatically, and anything where a wrong answer is expensive to correct.",
            "Price it per task, not per month. A tool that saves two hours a week is cheap; one that saves ten minutes is a subscription you forget.",
        ],
    ),
    (
        "how-to-prepare-for-exams",
        "How to Prepare for Exams",
        "A repeatable revision plan, built around short sessions and active recall.",
        "Uploaded",
        731,
        2870,
        "education",
        dt(30, 9, month=10),
        4,
        True,
        [
            {"at": "00:00", "label": "Building a revision plan"},
            {"at": "04:05", "label": "Active recall over rereading"},
            {"at": "08:30", "label": "The week of the exam"},
        ],
        [
            "Start from the syllabus, not from the textbook. The syllabus tells you what will be asked.",
            "Rereading feels productive and mostly is not. Close the book and write what you remember, then check.",
            "In the last week, sleep matters more than one more chapter. A rested recall beats a tired reread.",
        ],
    ),
    (
        "afrobeats-production-breakdown",
        "Afrobeats Production Breakdown",
        "A producer walks through the drums, bass and vocal chain behind a modern Afrobeats record.",
        "Vimeo",
        965,
        4490,
        "entertainment",
        dt(26, 10, month=10),
        5,
        False,
        [
            {"at": "00:00", "label": "The drum pattern"},
            {"at": "05:00", "label": "Bass and space"},
            {"at": "10:20", "label": "The vocal chain"},
        ],
        [
            "The groove is built on a shaker pattern that never changes, which is what lets everything else move around it.",
            "The bass sits behind the kick rather than on top of it. That small delay is most of the feel.",
            "The vocal chain is short: a little compression, a little saturation, and a reverb that is barely audible on its own.",
        ],
    ),
]

ADS = [
    ("Homepage leaderboard", "home-leaderboard", "home", "all", 280),
    ("Homepage rail", "home-rail", "home", "desktop", 600),
    ("Article after second paragraph", "article-inline-1", "article", "all", 280),
    ("Article before conclusion", "article-inline-2", "article", "all", 280),
    ("Resource list after first row", "resource-list-1", "resource-list", "all", 250),
    ("Document below preview", "document-below-preview", "document", "all", 280),
    ("Video below description", "video-below-description", "video", "all", 250),
]


async def _user_by_email(session: AsyncSession, email: str) -> User:
    return (
        await session.execute(select(User).where(User.email == email))
    ).scalars().one()


async def seed_if_empty(session: AsyncSession, *, force: bool = False) -> bool:
    existing = int((await session.execute(select(func.count()).select_from(Article))).scalar_one())
    if existing and not force:
        return False

    users: dict[str, User] = {}
    for email, name, role, title in USERS:
        user = (
            await session.execute(select(User).where(User.email == email))
        ).scalars().one_or_none()
        if user is None:
            user = User(
                email=email,
                slug=slugify(name),
                name=name,
                role=role,
                title=title,
                bio=(
                    f"{name} writes and edits for FORUM24. This profile is demo content "
                    "for the editorial dashboard."
                ),
                hashed_password=hash_password(DEMO_PASSWORD),
            )
            session.add(user)
        users[email] = user
    await session.flush()

    categories: dict[str, Category] = {}
    for order, (slug, name, description) in enumerate(CATEGORIES):
        category = (
            await session.execute(select(Category).where(Category.slug == slug))
        ).scalars().one_or_none()
        if category is None:
            category = Category(slug=slug, name=name, description=description, sort_order=order)
            session.add(category)
        categories[slug] = category
    await session.flush()

    tag_cache: dict[str, Tag] = {}
    for _, _, _, _, _, _, _, _, _, tags, *_ in ARTICLES:
        for name in tags:
            slug = slugify(name)
            if slug not in tag_cache:
                tag = (
                    await session.execute(select(Tag).where(Tag.slug == slug))
                ).scalars().one_or_none()
                if tag is None:
                    tag = Tag(slug=slug, name=name)
                    session.add(tag)
                tag_cache[slug] = tag
    await session.flush()

    for (
        slug,
        title,
        standfirst,
        category_slug,
        author_email,
        published,
        reading_time,
        views,
        cover,
        tags,
        reviewer_email,
        featured,
        trending,
        topic,
    ) in ARTICLES:
        article = (
            await session.execute(select(Article).where(Article.slug == slug))
        ).scalars().unique().one_or_none()
        if article is not None:
            continue
        article = Article(
            slug=slug,
            title=title,
            standfirst=standfirst,
            body=long_body(topic),
            status="Published",
            category_id=categories[category_slug].id,
            author_id=users[author_email].id,
            reviewed_by_id=users[reviewer_email].id if reviewer_email else None,
            cover=cover,
            reading_time=reading_time,
            views=views,
            featured=featured,
            trending=trending,
            ai_draft=featured,
            published_at=published,
            seo_title=title[:60],
            seo_description=standfirst[:155],
            primary_keyword=topic.lower(),
        )
        article.tags = [tag_cache[slugify(name)] for name in tags]
        session.add(article)

    for slug, title, standfirst, category_slug, author_email, status, ai_draft in DRAFTS:
        exists = (
            await session.execute(select(Article).where(Article.slug == slug))
        ).scalars().unique().one_or_none()
        if exists is not None:
            continue
        session.add(
            Article(
                slug=slug,
                title=title,
                standfirst=standfirst,
                body=long_body(title.lower()),
                status=status,
                category_id=categories[category_slug].id,
                author_id=users[author_email].id,
                cover=0,
                reading_time=5,
                ai_draft=ai_draft,
                seo_title=title[:60],
                seo_description=standfirst[:155],
            )
        )

    for (
        slug,
        title,
        description,
        fmt,
        size_bytes,
        pages,
        category_slug,
        downloads,
        published,
        cover,
        publisher,
        licence,
        version,
        downloadable,
    ) in DOCUMENTS:
        exists = (
            await session.execute(select(Document).where(Document.slug == slug))
        ).scalars().unique().one_or_none()
        if exists is not None:
            continue
        session.add(
            Document(
                slug=slug,
                title=title,
                description=description,
                format=fmt,
                size_bytes=size_bytes,
                pages=pages,
                category_id=categories[category_slug].id,
                downloads=downloads,
                views=downloads * 2,
                published_at=published,
                cover=cover,
                publisher=publisher,
                licence=licence,
                version=version,
                downloadable=downloadable,
                status="Ready",
                file_key=f"documents/{slug}.{fmt.lower()}",
            )
        )

    for (
        slug,
        title,
        description,
        provider,
        duration_seconds,
        views,
        category_slug,
        published,
        cover,
        embeddable,
        chapters,
        transcript,
    ) in VIDEOS:
        exists = (
            await session.execute(select(Video).where(Video.slug == slug))
        ).scalars().unique().one_or_none()
        if exists is not None:
            continue
        session.add(
            Video(
                slug=slug,
                title=title,
                description=description,
                provider=provider,
                duration_seconds=duration_seconds,
                views=views,
                category_id=categories[category_slug].id,
                published_at=published,
                cover=cover,
                embeddable=embeddable,
                chapters=chapters,
                transcript=transcript,
                status="Ready",
            )
        )

    for name, slot_id, page_type, device, min_height in ADS:
        exists = (
            await session.execute(select(AdPlacement).where(AdPlacement.slot_id == slot_id))
        ).scalars().one_or_none()
        if exists is None:
            session.add(
                AdPlacement(
                    name=name,
                    slot_id=slot_id,
                    page_type=page_type,
                    device=device,
                    min_height=min_height,
                    enabled=True,
                    consent_required=True,
                )
            )

    if (await session.get(AiSetting, 1)) is None:
        session.add(
            AiSetting(
                id=1,
                provider="openai",
                model="gpt-4.1-mini",
                temperature=0.4,
                max_tokens=2000,
                features=dict(DEFAULT_AI_FEATURES),
                monthly_budget_usd=150,
                api_key_last4="9f2c",
            )
        )

    if not (await session.execute(select(AiTask.id).limit(1))).scalar_one_or_none():
        done = dt(11, 8)
        session.add_all(
            [
                AiTask(
                    kind="trends",
                    status="done",
                    prompt={"region": "Nigeria", "window": "24h"},
                    result={"topics": 6},
                    tokens=1240,
                    cost_usd=0.0186,
                    finished_at=done,
                ),
                AiTask(
                    kind="draft",
                    status="failed",
                    prompt={"topic": "Nigeria AI policy draft"},
                    error="Provider timeout after 30s",
                    tokens=0,
                    cost_usd=0.0,
                ),
                AiTask(
                    kind="fact-check",
                    status="done",
                    prompt={"claims": 3},
                    result={"unsupported": 1, "conflicting": 1, "needsSource": 1},
                    tokens=860,
                    cost_usd=0.0129,
                    finished_at=done,
                ),
                AiTask(
                    kind="seo",
                    status="queued",
                    prompt={"articleId": 1},
                ),
            ]
        )

    for email in ("reader.one@example.com", "reader.two@example.com", "reader.three@example.com"):
        if not (
            await session.execute(
                select(NewsletterSubscriber.id).where(NewsletterSubscriber.email == email)
            )
        ).scalar_one_or_none():
            session.add(NewsletterSubscriber(email=email, consent=True, confirmed=True))

    # Flush the new articles before looking one up; the session runs with
    # autoflush disabled so that seed logic stays predictable.
    await session.flush()
    article_one = (
        await session.execute(
            select(Article).where(Article.slug == "nigeria-ai-startups-african-infrastructure")
        )
    ).scalars().unique().one_or_none()
    if article_one and not (await session.execute(select(Comment.id).limit(1))).scalar_one_or_none():
        session.add_all(
            [
                Comment(
                    article_id=article_one.id,
                    author_name="Chidi Okafor",
                    email="chidi@example.com",
                    body="This is the kind of reporting the sector needs. More on the infrastructure angle, please.",
                    status="Approved",
                ),
                Comment(
                    article_id=article_one.id,
                    author_name="Amina Yusuf",
                    email="amina@example.com",
                    body="Can you publish the underlying data for the funding figures?",
                    status="Pending",
                ),
            ]
        )

    if not (await session.execute(select(AuditLog.id).limit(1))).scalar_one_or_none():
        session.add(
            AuditLog(
                action="system.seed",
                entity_type="system",
                detail={"note": "Demo content seeded for the FORUM24 scaffold."},
            )
        )

    await session.commit()
    return True


async def _run(reset: bool) -> None:
    async with engine.begin() as connection:
        if reset:
            await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        created = await seed_if_empty(session, force=reset)
    print("Seeded demo content." if created else "Database already has content; nothing to do.")
    print(f"Sign in with admin@forum24.example / {DEMO_PASSWORD}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the FORUM24 demo database")
    parser.add_argument("--reset", action="store_true", help="drop and recreate every table first")
    args = parser.parse_args()
    asyncio.run(_run(args.reset))
