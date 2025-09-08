# Rabbit - AI-Powered Multiplatform Post Generator

## Overview

Rabbit is an AI-powered web application designed for influencers, creators, and personal brands to generate, stylize, and publish content across various social media platforms, including Instagram, LinkedIn, X (Twitter), and Discord. Its core purpose is to streamline content creation through a personalized 5-question onboarding flow, delivering platform-optimized posts complete with captions, hashtags, and image prompts. The project aims to provide a comprehensive content generation and management solution to enhance digital presence and engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Color Schemes**: WCAG 2.1 AA compliant dark mode with 4.5:1 contrast ratio, ensuring visibility for text and UI elements. Premium color palette including Vibrant Indigo, Fresh Mint Green, Warm Pink, and Soft Off-White.
- **Templates/Design Approaches**: Responsive design using Tailwind CSS, high-quality UI components via shadcn/ui. Full-width responsive layout with glassmorphism effects and interactive elements.
- **Accessibility**: Dynamic section titles, improved dark mode contrast, and CSS utility classes for accessible text.
- **Branding**: Enhanced "RabbitHabbit" heading with larger font sizes, gradient effects, and a clear tagline. Cleaned up redundant logos in navigation and dashboards.

### Technical Implementations
- **Frontend**: React with TypeScript, Vite for fast builds, Wouter for routing, and TanStack Query for server state management.
- **Backend**: Express.js with TypeScript for REST API endpoints, full-stack type safety with shared schemas.
- **Authentication**: Session-based authentication using Express sessions with PostgreSQL storage, multi-provider OAuth (Google, Apple, X) via Passport.js. Demo login available.
- **Content Generation Engine**: Integration with OpenAI (GPT-4o for text, DALL-E for images). Supports custom keywords and themes. Includes an advanced content variation system to prevent repetition across platforms and platform-specific optimization. Features a comprehensive tone-based content generation system with 10 distinct writing styles, dynamically adjusting content based on platform and tone. Offers robust content length controls (Short, Medium, Long) and "Extended Version" functionality.
- **Image Generation**: Integrates multiple AI providers (OpenAI DALL-E, Replicate SDXL) with intelligent fallback systems and contextual prompt engineering.
- **Onboarding Flow**: A five-step process to personalize content generation: content type, target audience, tone preference, platform selection, and image generation preferences.
- **Content Management**: Storage and retrieval of generated content, content history, platform-specific formatting, and hashtag generation.
- **Data Flow**: User preferences drive content generation via AI APIs, optimized for selected platforms, stored in PostgreSQL, and presented for review. Direct publishing to social platforms is planned.

### System Design Choices
- **Database**: PostgreSQL as the primary database using Neon serverless PostgreSQL, with Drizzle ORM for type-safe operations.
- **Modularity**: Separation of frontend and backend concerns.
- **Scalability**: Designed with serverless database and optimized AI API calls for performance.
- **Robustness**: Comprehensive error handling, session persistence, and proper API key management for external services.

## External Dependencies

- **AI Services**:
    - **OpenAI API**: GPT-4o for text generation, DALL-E for image generation.
    - **Replicate SDXL**: For high-quality image generation.
    - **Google Gemini**: As a primary free AI provider.
    - **Groq**: Ultra-fast AI provider.
    - **Hugging Face**: For various AI models, including Stable Diffusion v1.5 for image generation.
- **Database**:
    - **Neon PostgreSQL**: Serverless PostgreSQL database.
- **Authentication**:
    - **OAuth Providers**: Google, Apple, X APIs.
- **Development Tools**:
    - **Replit Integration**: Cartographer plugin.