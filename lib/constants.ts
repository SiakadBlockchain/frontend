import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Shield,
  Settings,
  LogOut,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  Lock,
} from 'lucide-react';

// Navigation Menu Items
export const SIDEBAR_ITEMS = {
  validator: [
    { label: 'Dashboard', href: '/dashboard/validator', icon: LayoutDashboard },
    { label: 'Transactions', href: '/dashboard/validator/transactions', icon: FileText },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Universities', href: '/dashboard/admin/universities', icon: GraduationCap },
    { label: 'Students', href: '/dashboard/admin/students', icon: Users },
    { label: 'Users', href: '/dashboard/admin/users', icon: Users },
    { label: 'Diplomas', href: '/dashboard/admin/diplomas', icon: FileText },
  ],
  university: [
    { label: 'Dashboard', href: '/dashboard/university', icon: LayoutDashboard },
    { label: 'Students', href: '/dashboard/university/students', icon: Users },
    { label: 'Diplomas', href: '/dashboard/university/diplomas', icon: FileText },
  ],
};

export const PUBLIC_NAV_ITEMS = [
  { label: 'Home', href: '/' },
];

// Status Badges
export const STATUS_COLORS = {
  active: 'bg-background text-foreground border-foreground',
  inactive: 'bg-muted text-muted-foreground border-border',
  suspended: 'bg-destructive/10 text-destructive border-destructive',
  pending: 'bg-background text-foreground border-border',
  confirmed: 'bg-background text-foreground border-foreground',
  failed: 'bg-destructive/10 text-destructive border-destructive',
  enrolled: 'bg-background text-foreground border-foreground',
  graduated: 'bg-background text-foreground border-foreground',
  issued: 'bg-background text-foreground border-foreground',
  verified: 'bg-background text-foreground border-foreground',
  revoked: 'bg-destructive/10 text-destructive border-destructive',
};

export const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  pending: 'Pending',
  confirmed: 'Confirmed',
  failed: 'Failed',
  enrolled: 'Enrolled',
  graduated: 'Graduated',
  withdrawn: 'Withdrawn',
  issued: 'Issued',
  verified: 'Verified',
  revoked: 'Revoked',
  super_admin: 'Super Admin',
  moderator: 'Moderator',
};

// Icon Map
export const ICON_MAP = {
  dashboard: LayoutDashboard,
  users: Users,
  graduation: GraduationCap,
  file: FileText,
  shield: Shield,
  settings: Settings,
  logout: LogOut,
  search: Search,
  plus: Plus,
  edit: Edit2,
  delete: Trash2,
  view: Eye,
  check: CheckCircle,
  alert: AlertCircle,
  clock: Clock,
  lock: Lock,
};

// Table Configuration
export const TABLE_COLUMNS = {
  universities: ['name', 'code', 'country', 'status', 'studentsCount', 'diplomasIssued', 'actions'],
  students: ['studentId', 'name', 'program', 'status', 'enrollmentDate', 'expectedGraduation', 'actions'],
  diplomas: ['studentName', 'program', 'status', 'issuanceDate', 'verificationCount', 'actions'],
  users: ['email', 'name', 'role', 'status', 'lastLogin', 'actions'],
};

// Pagination
export const ITEMS_PER_PAGE = 10;

// Modal Types
export const MODAL_TYPES = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  CREATE: 'create',
} as const;

// Role Display Names
export const ROLE_NAMES = {
  validator: 'Blockchain Validator',
  admin: 'System Administrator',
  university: 'University Administrator',
};

// Demo Data Defaults
export const DEFAULT_COUNTRY = 'Indonesia';
export const DEFAULT_CURRENCY = 'IDR';
export const SYSTEM_NAME = 'SiakadChain';
