"""Domain vocabulary shared by the API, the seed data and the admin flows."""

ARTICLE_STATUSES = (
    "Draft",
    "Pending Review",
    "Approved",
    "Scheduled",
    "Published",
    "Archived",
)

ROLES = ("admin", "editor", "reviewer", "author", "reader")

# Who may move an article through each editorial gate.
ROLE_RANK = {"reader": 0, "author": 1, "reviewer": 2, "editor": 3, "admin": 4}

PUBLISH_ROLES = ("admin", "editor")
REVIEW_ROLES = ("admin", "editor", "reviewer")

PROVIDERS = ("YouTube", "Vimeo", "Uploaded")
DOC_FORMATS = ("PDF", "DOCX", "PPTX")
RESOURCE_STATUSES = ("Queued", "Uploading", "Processing", "Ready", "Failed")
AI_TASK_STATUSES = ("queued", "running", "done", "failed")
AI_TASK_KINDS = ("trends", "research", "draft", "seo", "fact-check")

PAGE_TYPES = ("home", "article", "resource-list", "document", "video")
DEVICES = ("all", "mobile", "desktop")
COMMENT_STATUSES = ("Pending", "Approved", "Rejected", "Spam")

DEFAULT_AI_FEATURES = {
    "trends": True,
    "research": True,
    "writer": True,
    "seo": True,
    "factCheck": True,
}
