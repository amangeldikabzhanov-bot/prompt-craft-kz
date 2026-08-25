# VibeBuild AI

VibeCoding KZ — Premium AI Platform MVP

Build a premium, modern, mobile-first AI platform called VibeCoding KZ.

1. Core concept

VibeCoding KZ is a Kazakh-first platform where beginners can discover AI tools, find useful prompts, manage projects, and eventually build AI-powered websites and applications through an AI Builder.

The product must feel like a serious modern AI startup — not a generic template.

Primary language: Kazakh (KZ).
Prepare the architecture for future RU / EN localization.

2. Visual direction

Create a highly polished premium visual identity:

Dark premium background

Near-black / deep navy surfaces

Electric blue as the main accent

Subtle violet secondary glow

Soft gradients

Glassmorphism used carefully

Large modern typography

Strong visual hierarchy

Rounded cards

Soft borders

Atmospheric background glow

Subtle animated particles / light effects

Clean spacing

Premium SaaS / AI startup aesthetic

Do NOT make the interface overly colorful or childish.

The design should feel futuristic, expensive, minimal and professional.

3. Hero section

Create a powerful landing hero.

Headline in Kazakh:

«Идеяңды жаз — AI жобаңды жасасын.»

Supporting text:

«AI құралдарын тап, дайын промпттарды қолдан, жобаларыңды басқар және идеяңды нақты өнімге айналдыр.»

Primary CTA:

«Builder-ді бастау»

Secondary CTA:

«AI құралдарын көру»

Add a visually impressive animated AI element behind or beside the hero content.

Use subtle motion:

floating glow

animated gradient

slow particle movement

soft pulse

text reveal

CTA hover animation

Animations must remain smooth and performant.

4. Main navigation — exactly 5 primary buttons

Create these five primary navigation buttons:

AI Tools

AI Finder

Prompts

Projects

Builder

Each button must have a real route/page.

Do not create fake buttons.

Each navigation item must have:

active state

hover state

smooth transition

subtle glow

icon

mobile-friendly interaction

Desktop navigation should look premium and spacious.

Mobile navigation should be redesigned specifically for mobile rather than simply shrinking the desktop navigation.

5. Pages

Create these initial pages:

AI Tools

A beautiful searchable AI tools directory.

Include categories such as:

Website Builder

Design

Writing

Video

Image

Automation

Coding

Marketing

Use premium animated cards.

AI Finder

Create an AI tool discovery interface.

Headline:

«Саған керек AI құралын тап.»

Search should recognize Kazakh/Russian/English variations and common synonyms.

Examples:

ватсап

вотсап

WhatsApp

wa

чат-бот

дүкен

сайт

лендинг

Show relevant tool/category suggestions.

Prompts

Create a prompt library.

Categories:

Website

Business

Marketing

Design

Coding

Social Media

AI Assistant

Each prompt card should have:

title

short description

category

copy button

save button

Projects

Create a personal project dashboard.

Show:

project cards

project name

status

last updated

progress indicator

create project button

Example empty state:

«Алғашқы AI жобаңа бастау бер.»

Builder

Create the main VibeCoding Builder interface.

Headline:

«Идеяңды жаз — AI жобаңды жасасын.»

Large input area with placeholder:

«Мысалы: Ресторанға заманауи сайт жаса. Меню, үстел брондау және WhatsApp батырмасы болсын.»

Add:

character counter

example prompts

generate button

AI thinking animation

generation progress state

project preview area

The Builder should feel like the most important feature of the entire platform.

6. Animation system

Implement a consistent animation system across the entire product.

Use:

smooth page transitions

fade + slide reveal

staggered card entrance

button micro-interactions

hover elevation

glow transitions

animated gradient backgrounds

subtle floating elements

Builder AI thinking animation

loading skeletons

Avoid excessive animation.

Everything must feel smooth, premium and intentional.

Respect prefers-reduced-motion.

7. Responsive design

Design mobile-first.

The interface must work beautifully on:

iPhone

Android

tablet

desktop

No horizontal scrolling.

Buttons must be easy to tap.

Cards should adapt naturally to screen size.

8. UX rules

Do not create unnecessary complexity.

The user should immediately understand:

What is VibeCoding KZ?

What can I do here?

Where do I start?

The primary user journey should be:

Home → Builder → Create Project

Secondary journeys:

Home → AI Tools

Home → AI Finder

Home → Prompts

Home → Projects

9. Code quality

Use a clean reusable component architecture.

Create reusable:

Navbar

Button

Card

ToolCard

PromptCard

ProjectCard

PageHeader

SearchInput

Modal

Toast

LoadingState

Keep the design system consistent across all pages.

Do not duplicate components unnecessarily.

10. Important

Do not replace the design with a generic SaaS template.

Do not remove the animations.

Do not make the UI overly bright.

Do not create fake functionality where a real interactive component can be implemented.

Prioritize:

Premium visual quality + smooth animation + excellent mobile UX + clean architecture.

Build the foundation so authentication, Supabase database, AI integrations, marketplace and payments can be added later without rebuilding the entire frontend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d3a7facd-4e0e-4657-b974-0863d9a719d5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
