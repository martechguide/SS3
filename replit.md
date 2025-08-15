# Overview

This is a high-performance full-stack educational video learning platform built with React, Express, and PostgreSQL, optimized to handle 1-10 lakh (100,000-1,000,000) concurrent users. The application provides structured learning through batches and subjects, with video content delivery, progress tracking, and comprehensive scalability optimizations. It features Replit OAuth authentication with email whitelist access control, ensuring only authorized users can access the learning materials.

## Scalability Features
- **High-traffic optimizations**: Database connection pooling (100 connections), compression middleware, rate limiting
- **Security**: Helmet.js security headers, CORS configuration, express-rate-limit for DDoS protection  
- **Caching**: Multi-level caching with TTL for static content (30 min), video metadata (1 hour), user content (5 min)
- **Performance monitoring**: Real-time metrics for memory usage, CPU utilization, and response times
- **Autoscale deployment**: Configured for 2-20 instances with 2 CPU cores and 4GB RAM each

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the bundler
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OAuth with OpenID Connect using Passport.js
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with role-based access control

## Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Structure**:
  - Users table for authentication (required for Replit Auth)
  - Sessions table for session storage (required for Replit Auth)
  - Email whitelist table for access control
  - Batches table for organizing learning content
  - Subjects table nested under batches
  - Videos table nested under subjects
  - User progress tracking table
  - Ad settings table for admin configuration

## Authentication & Authorization
- **Primary Auth**: Replit OAuth integration with Google Sign-In
- **Access Control**: Email whitelist system - only approved emails can access content
- **Session Handling**: Server-side sessions with PostgreSQL storage
- **Route Protection**: Middleware-based authentication checks on all protected routes

## Content Management
- **Hierarchical Structure**: Batches → Subjects → Videos
- **Video Integration**: YouTube video embedding with privacy-enhanced URLs and comprehensive protection system
- **Universal Protection System**: Standardized `VideoProtectionSystem` component applied to ALL video embeds automatically
- **Mandatory Implementation**: Every video embed MUST use `VideoProtectionSystem` for consistent blocking functionality
- **Transparent Protection**: All blocking patches are transparent by default with hover visibility (black 80% opacity on hover)
- **Full-Width Coverage**: Top blocker covers entire player width to prevent mobile "Y" visibility
- **Black Video ID Patch**: Bottom center patch remains permanently black to hide video ID numbers
- **Hover Feedback**: Interactive areas become visible on hover to show protection zones
- **Future-Proof Design**: All new video components automatically inherit protection when using the universal system
- **Responsive Design**: Protection patches adapt to mobile, tablet, and desktop viewports with percentage-based positioning
- **Progress Tracking**: User watch time and completion status tracking
- **Video Seeking Controls**: Custom forward/backward seeking with interactive timeline
- **Hover Controls**: Video controls appear on hover with play/pause, skip, and volume
- **Timeline Scrubbing**: Interactive seek bar for precise video navigation
- **Admin Features**: Admin dashboard for content and user management

## Multi-Network Ad Monetization System
- **Universal Ad Integration**: Comprehensive ad system supporting AdSense, Adsterra, and promotional ads
- **Promotional Video Ads**: Custom brand partner video advertisements with full video player controls
- **Pre-roll Video System**: Brand promotional videos play before educational content with 5-second skip functionality  
- **Interactive Video Controls**: Full video player with play/pause, volume, progress bar, and click-to-website
- **Brand Partnership Management**: Complete admin dashboard for managing brand video campaigns and analytics
- **Analytics Tracking**: Detailed tracking for video ad impressions, clicks, completion rates, and user engagement
- **Pause-Triggered Popup Ads**: Small popup ads appear when users pause videos (2-second delay)
- **Between-Videos Ads**: Native and banner ads displayed between video lessons
- **Multi-Placement Support**: Header, sidebar, footer, pause-overlay, between-videos, and native placements
- **Revenue Optimization**: Multi-network approach maximizes earnings with fast-approval alternatives
- **Educational Content Premium**: Higher CPM rates for educational audiences ($2-12 CPM range)
- **Instant Monetization**: Adsterra provides 2-10 minute approval for immediate revenue
- **Advanced Ad Controls**: Complete admin dashboard for ad configuration and revenue tracking
- **Responsive Ad System**: All ad formats adapt to mobile, tablet, and desktop layouts

## Development Environment
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Hot Reload**: Vite dev server with HMR for development
- **Database Migrations**: Drizzle Kit for schema management

# External Dependencies

## Core Services
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Authentication Provider**: Replit OAuth service
- **Video Content**: YouTube (embedded via privacy-enhanced nocookie domain)

## Key Libraries
- **UI Framework**: React 18 with TypeScript
- **Backend Framework**: Express.js with TypeScript
- **Database**: Drizzle ORM with Neon PostgreSQL driver
- **Authentication**: Passport.js with OpenID Connect strategy
- **Form Validation**: Zod schema validation
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: TanStack Query for API state

## Development Tools
- **Bundler**: Vite with React plugin
- **Type Checking**: TypeScript compiler
- **CSS Processing**: PostCSS with Tailwind and Autoprefixer
- **Development Server**: Express with Vite middleware integration

## Environment Requirements
- Node.js runtime with ES modules support
- PostgreSQL database connection
- Replit environment variables for OAuth configuration
- Session secret for secure session management