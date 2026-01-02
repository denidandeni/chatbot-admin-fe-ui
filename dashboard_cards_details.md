AMANI AI - DASHBOARD CARDS DATA SOURCE SUGGESTIONS

This document provides recommended backend sources for the dashboard cards.

1. SUMMARY CARDS

CARD: AI Agents
METRIC: Total count of chatbots
SOURCE SUGGESTION: GET /api/v1/agents/count
DESCRIPTION: Should return the total number of active AI agents available.

CARD: Total Organization
METRIC: Total count of organizations
SOURCE SUGGESTION: GET /api/v1/organizations/stats
DESCRIPTION: Should return the total number of registered organizations.

CARD: Total Conversations
METRIC: Cumulative chats
SOURCE SUGGESTION: GET /api/v1/analytics/conversations/total
DESCRIPTION: Aggregated count of all messages/sessions across all agents.

CARD: Chat Resolved
METRIC: AI resolution percentage
SOURCE SUGGESTION: GET /api/v1/analytics/conversations/resolved-rate
DESCRIPTION: Percentage of queries successfully handled by AI without human escalation.


2. ANALYTICS CARDS

CARD: Credit Usage
METRIC: Monthly consumption vs. allocation
SOURCE SUGGESTION: GET /api/v1/billing/usage
DESCRIPTION: Current credits used, remaining balance, and plan limits.

CARD: Topic Analysis
METRIC: Keyword trends and categories
SOURCE SUGGESTION: GET /api/v1/analytics/topics/trends
DESCRIPTION: NLP-extracted keywords and category distribution (Support, Billing, etc.).


3. INDIVIDUAL AGENT PERFORMANCE

SOURCE SUGGESTION: GET /api/v1/agents/performance
DESCRIPTION: List of agents with their specific metrics like 'total_conversations', 'avg_response_time', and 'status'.


ARCHITECTURAL NOTES:
- All suggestions above recommend RESTful endpoints returning JSON.
- For high-traffic dashboards, consider using a caching layer (Redis) for analytics endpoints.
- Current UI implementation uses mock data and should be updated to these suggested endpoints.
