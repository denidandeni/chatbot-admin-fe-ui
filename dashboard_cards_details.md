AMANI AI - DASHBOARD CARDS AND DATA SOURCES

This document lists all dashboard cards and their corresponding data sources.

1. SUMMARY CARDS

CARD: AI Agents
METRIC: Total count of chatbots
SOURCE: getChatbots() in services/chatbot.ts
DETAILS: Calls /api/chatbots. If the API is offline, it displays a mock list of 4 agents.

CARD: Total Organization
METRIC: Total count of organizations
SOURCE: getOrganizations() in services/organization.ts
DETAILS: Calls /api/admin/organizations. Returns "Demo Organization" as a fallback.

CARD: Total Conversations
METRIC: Cumulative chats
SOURCE: Mocked (Hardcoded)
VALUE: 1247

CARD: Chat Resolved
METRIC: AI resolution percentage
SOURCE: Mocked (Hardcoded)
VALUE: 65%


2. ANALYTICS CARDS

CARD: Credit Usage
METRIC: Monthly consumption vs. allocation
SOURCE: Mocked UI Component
VALUES: Current: 47,250 / 100,000. Used: 47.3K. Remaining: 52.7K.

CARD: Topic Analysis
METRIC: Keyword trends and categories
SOURCE: Mocked UI Component
TOPICS: Support (28%), Product Info (22%), Billing (18%)


3. INDIVIDUAL AGENT PERFORMANCE

Displays conversations per agent (Current values are mocked):
- Customer Support Bot (Active): 342
- Sales Assistant (Active): 289
- Technical Support (Inactive): 156
- Billing Assistant (Active): 203


DEVELOPER NOTES:
To fetch live data for conversations, credits, or topics, new endpoints must be implemented in the backend and connected via new functions in the services directory.
