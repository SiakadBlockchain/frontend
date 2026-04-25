'use client';

import { useAuth } from './use-auth';

export function useDashboardRole() {
  const { role, user, isAuthenticated } = useAuth();

  const isValidator = role === 'validator';
  const isAdmin = role === 'admin';
  const isUniversity = role === 'university';

  const canManageUsers = isAdmin;
  const canManageUniversities = isAdmin;
  const canManageDiplomas = isAdmin || isUniversity;
  const canViewTransactions = isValidator || isAdmin;
  const canValidateBlocks = isValidator;
  const canIssueUniversityDiploma = isUniversity;

  return {
    role,
    isValidator,
    isAdmin,
    isUniversity,
    isAuthenticated,
    user,
    canManageUsers,
    canManageUniversities,
    canManageDiplomas,
    canViewTransactions,
    canValidateBlocks,
    canIssueUniversityDiploma,
  };
}
