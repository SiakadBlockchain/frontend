# SiakadChain - Blockchain Academic Credential System

A modern, fully-functional blockchain-based academic information system built with Next.js 16, React 19, and Tailwind CSS.

## Features

- **Multi-Role Dashboard System**
  - Validator: Monitor blockchain transactions and validate blocks
  - Admin: Manage universities, students, users, and diplomas
  - University: Manage students and issue diplomas

- **Authentication**
  - Login/Register system with role-based access
  - Mock MetaMask wallet connection
  - Session management with localStorage

- **Diploma Management**
  - Public diploma verification page
  - Blockchain-based diploma issuance
  - Diploma tracking and verification

- **Blockchain Explorer**
  - View blocks and transactions
  - Search functionality
  - Real-time blockchain status

- **CRUD Operations**
  - Manage universities with detailed profiles
  - Student enrollment and status tracking
  - Admin user management
  - Diploma verification and issue tracking

- **Design**
  - Minimalist black & white aesthetic
  - Responsive layout (mobile-first)
  - Smooth transitions and hover states
  - Breadcrumb navigation
  - Modal-based detail views

## Demo Credentials

### System Admin
- **Email**: admin@siakadchain.com
- **Password**: demo

### Blockchain Validator
- **Email**: validator@siakadchain.com
- **Password**: demo

### University Administrator
- **Email**: university@itb.ac.id
- **Password**: demo

## Project Structure

```
app/
├── auth/                      # Authentication pages
├── dashboard/                 # Role-based dashboards
│   ├── validator/            # Validator dashboard
│   ├── admin/                # Admin dashboard
│   └── university/           # University dashboard
├── verify/                   # Public diploma verification
├── explorer/                 # Blockchain explorer
└── page.tsx                  # Home redirect

components/
├── shared/                   # Shared layout components
│   ├── app-sidebar.tsx
│   ├── app-navbar.tsx
│   ├── main-layout.tsx
│   └── breadcrumbs.tsx
├── forms/                    # Form components
└── ui/                       # shadcn/ui components

hooks/
├── use-auth.ts              # Authentication state
├── use-modal.ts             # Modal state
└── use-dashboard-role.ts    # Role detection

lib/
├── constants.ts             # UI constants and navigation
├── mock-data.ts             # Mock data for demo
└── utils.ts                 # Utility functions

types/
└── index.ts                 # TypeScript type definitions
```

## Technologies

- **Framework**: Next.js 16.2 with App Router
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS 4.2
- **Icons**: Lucide React
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form + Zod
- **Typography**: Geist font family

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Run development server**
   ```bash
   pnpm dev
   ```

3. **Open browser**
   - Visit http://localhost:3000
   - Use demo credentials above to login

## Key Pages

### Public Pages
- `/` - Home (redirects to verify or dashboard)
- `/auth` - Login/Register page
- `/verify` - Public diploma verification
- `/explorer` - Blockchain explorer

### Protected Pages (Require Login)
- `/dashboard` - Role-based dashboard redirect
- `/dashboard/validator` - Validator dashboard
- `/dashboard/admin` - Admin dashboard with CRUD interfaces
- `/dashboard/university` - University dashboard

## Features Demo

### 1. Authentication
- Login with demo credentials
- Register new accounts
- Mock MetaMask wallet connection
- Session persistence

### 2. Diploma Verification
- Search by diploma ID or blockchain hash
- View complete diploma details
- See blockchain verification status

### 3. Blockchain Explorer
- View recent blocks
- Search transactions
- Monitor network status

### 4. Admin Management
- Manage universities (CRUD)
- Manage students
- Manage diplomas
- Manage system users

### 5. University Operations
- View enrolled students
- Issue new diplomas
- Track diploma verification

## Design System

- **Colors**: Pure black & white with grayscale (oklch)
- **Spacing**: Generous padding (p-6) and gaps (gap-6)
- **Borders**: 1px thin borders instead of shadows
- **Rounded Corners**: rounded-md consistent throughout
- **Hover States**: Subtle background color changes
- **Transitions**: Smooth 200ms transitions on all interactive elements

## State Management

- **Auth State**: `useAuth()` hook with localStorage persistence
- **Modal State**: `useModal()` hook for detail/edit modals
- **Role Detection**: `useDashboardRole()` hook for permission checking
- **Mock Data**: In-memory data that persists per session

## Notes

- All data is mock and not persisted to a database
- Blockchain transactions are simulated
- MetaMask connection is mocked
- Form submissions are instant (no real API calls)
- Perfect for demo, presentation, and prototyping purposes

## Future Enhancements

- Real blockchain integration (Web3.js)
- Database integration (Supabase/Neon)
- Real wallet connection
- File upload and IPFS integration
- Email notifications
- Advanced search and filtering
- Export diploma as PDF
- QR code verification
