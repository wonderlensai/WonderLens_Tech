# Project Structure

The codebase is organized into frontend and backend folders:

```
WonderLens_Tech/
├── frontend/              # Next.js application
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API routes (upload, frames, auth)
│   │   ├── app/         # Main app pages
│   │   ├── login/       # Login page
│   │   └── page.tsx     # Home page
│   ├── lib/             # Utility functions
│   ├── middleware.ts    # Route middleware
│   ├── next.config.js   # Next.js configuration
│   ├── tsconfig.json    # TypeScript configuration
│   ├── tailwind.config.ts
│   └── package.json     # Frontend dependencies
│
├── backend/              # Backend services (future)
│   └── package.json     # Backend dependencies
│
├── data/                # Data storage
│   └── frames/         # Extracted video frames
│
├── api/                 # Legacy API (old structure)
├── package.json         # Root workspace config
└── vercel.json         # Vercel deployment config
```

## Running the Application

### From Root
```bash
npm run dev          # Runs frontend dev server
npm run build        # Builds frontend
npm run start        # Starts production server
```

### From Frontend Directory
```bash
cd frontend
npm run dev
```

## Notes

- The frontend contains the Next.js app with all pages, components, and API routes
- The backend folder is reserved for future separate backend services
- API routes are currently in `frontend/app/api/` (Next.js API routes)
- Data storage (frames) is in `data/frames/` at the root level
- Vercel is configured to deploy from the `frontend` directory
