# 📚 Next.js + TypeScript Flashcards

## Server Actions & Data Flow

### Server Actions
**Q:** How do you pass data from frontend to backend in Next.js?
**A:** Use Server Actions with `"use server"`. Call the function directly—Next.js handles the HTTP request automatically. The function arguments ARE your `req.body`.

---

### try/catch/finally
**Q:** How does error handling flow work?
**A:** 
- `try` - Runs code line by line until an error
- `catch` - Runs ONLY if there's an error (skips remaining try code)
- `finally` - ALWAYS runs (success or error)

---

### localStorage for Navigation
**Q:** How to pass data between pages?
**A:** Save to `localStorage.setItem('key', JSON.stringify(data))`, then read with `JSON.parse(localStorage.getItem('key'))` on the new page.

---

### Calling Async Inside Async
**Q:** Can you call an async function inside another async?
**A:** Yes! `const result1 = await fn1(); const result2 = await fn2(result1);`

---

## TypeScript Basics

### useState Generics
**Q:** What is `useState<any>(null)`?
**A:** The `<any>` is a TypeScript generic telling what type the state will hold. Use `<Type | null>` when starting with null.

---

### type vs interface
**Q:** What's the difference?
**A:** Both define object shapes. `type` is more flexible (unions, primitives). `interface` is for objects only but can extend. Either works for objects.

---

### Multi-line Strings
**Q:** How to write multi-line strings in TypeScript?
**A:** Use backticks (template literals): `` `Line 1 ${variable} Line 2` ``

---

### JSON.stringify for Logging
**Q:** Why use `JSON.stringify(obj, null, 2)`?
**A:** Node.js shows `[Object]` for nested objects. `JSON.stringify` with `null, 2` pretty-prints with 2-space indentation.

---

## Next.js Routing

### File-Based Routing
**Q:** How does `router.push('/results')` find the right page?
**A:** Next.js maps folder structure to routes: `app/results/page.tsx` → `/results`

---

### Route Naming Convention
**Q:** Should routes be `jobDescriptor` or `job-descriptor`?
**A:** Use **kebab-case** (`job-descriptor`). URLs are lowercase by convention, hyphens are SEO-friendly.

---

### useRouter Bug
**Q:** Where must `useRouter()` be called?
**A:** At the **top level** of a component, NOT inside functions/callbacks. Hooks can't be called conditionally.

---

### 'use client' Directive
**Q:** Why did the results page break?
**A:** Typo: `'use-client'` (dash) instead of `'use client'` (space). Client components must have correct directive.

---

## React Context

### useContext Pattern
**Q:** Why use Context instead of props?
**A:** Avoids "prop drilling" (passing data through every component). Any component inside `<Provider>` can directly access data with `useContext`.

---

### Context Structure
**Q:** What are the 3 parts of a Context?
**A:**
1. `createContext()` - Creates the data bucket
2. `<Provider value={...}>` - Makes data available to children
3. `useContext()` or custom hook - Reads the data

---

## Pinecone & Gemini

### Pinecone Integration
**Q:** How do you query Pinecone with namespace?
**A:** `const namespace = pc.index(indexName, indexHost).namespace("your-namespace"); await namespace.searchRecords({...})`

---

### Pinecone `fields`
**Q:** What does `fields: ['title', 'description']` do?
**A:** Tells Pinecone which metadata columns to return. Like `SELECT title, description` in SQL. Must match your actual index field names.

---

### Google Gemini SDK
**Q:** Correct package for Gemini?
**A:** `npm install @google/genai`, import with `import { GoogleGenAI } from '@google/genai'`

---

### RAG (Retrieval Augmented Generation)
**Q:** What is RAG?
**A:** **R**etrieval (query Pinecone) → **A**ugmented (add context to prompt) → **G**eneration (send to LLM). Your app fetches relevant data, then asks Gemini to analyze it.

---

### Environment Variables
**Q:** When do `.env.local` changes take effect?
**A:** You must **restart** `npm run dev`. Next.js only reads env vars at startup.

---

## UI Components

### Loading State Pattern
**Q:** How to show loading UI in React?
**A:** `const [loading, setLoading] = useState(false)`. Set `true` before async call, `false` in `finally`. Conditionally render loading UI.

---

### TextGradient Props
**Q:** What controls the gradient animation width?
**A:** `spread={100}` - wider gradient sweep. `duration={1.5}` - animation speed. `highlightColor` & `baseColor` - colors.

---

### Tailwind Padding
**Q:** What is `px-16 py-8`?
**A:** `px-16` = horizontal padding (left/right). `py-8` = vertical padding (top/bottom). Numbers are multiplied by 0.25rem.

---

### Meteors Component
**Q:** How to add meteors to a card?
**A:** Import `Meteors`, add `<Meteors number={5} />` inside the card with `overflow-hidden` on the parent.

---

### `<pre>` Tag
**Q:** What does `<pre>` do?
**A:** Preserves whitespace, line breaks, and indentation. Used for displaying formatted JSON/code.
