# Dyuti Ghosh — Portfolio

A responsive portfolio built with Next.js, TypeScript, Tailwind CSS and Framer Motion. Includes an interactive Three.js humanoid robot, six content sections, mobile navigation, reduced-motion support and social links.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. Validate with `npm run typecheck` and `npm run build`.

## Personalise

- Edit contact details, skills, experience, projects, leadership and awards in `lib/content.ts`.
- The supplied August résumé is available at `public/resume.pdf`. Replace that file when your résumé changes.
- Email and LinkedIn are configured from the supplied documents. Add `profile.github` when available; the floating buttons currently show LinkedIn and email.
- Biography and education are in `components/Portfolio.tsx`. Content combines the supplied résumé and technical CVs; the newer résumé supplies Hanlon's completed June–July 2026 dates. Degree Curriculum Planner and MOCKOR retain brief descriptions from the original outline because the documents do not include their technical details.
- Adjust colours and layout in `app/globals.css`.

The robot is generated locally from 3D geometry, with sculpted carbon-fibre shells and an integrated metallic helmet, softbox lighting, articulated joints, eye-relative cursor tracking, drag-to-turn and keyboard controls, reduced-motion support, and a reserved loading area that displays only the actual model after its first rendered frame. It requires no external model or texture downloads.

Gaze uses monotonic exponential filtering around a fixed reference point, with no idle sway, head roll, or body following. Run `node scripts/check-robot-motion.mjs` to verify gaze direction, rotation limits, convergence and frame-rate independence.

## Browser validation

With Google Chrome installed, run `npm run build` and `npm start -- --port 3001`, then run `node scripts/check-portfolio.mjs` in another terminal. Set `PORTFOLIO_URL` to test a different local URL. The check exercises the robot, upward/downward gaze previews, mobile navigation, contact links, résumé download, responsive widths and reduced motion; screenshots are saved in `.test-output/`.

## Deployment

Import the repository into Vercel as a Next.js project, or run `npm run build` followed by `npm start` on a Node.js host. No environment variables are required.
