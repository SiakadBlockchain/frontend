'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  fetchStudents,
  fetchUsers,
  fetchDiplomas,
  fetchUniversities,
  fetchStudentsByUniversity,
  fetchDiplomasByUniversity,
} from '@/lib/api';

export function useDashboardData() {
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [diplomas, setDiplomas] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsRes, usersRes, diplomasRes, universitiesRes] =
          await Promise.all([
            fetchStudents(),
            fetchUsers(),
            fetchDiplomas(),
            fetchUniversities(),
          ]);

        setStudents(studentsRes.data);
        setUsers(usersRes.data);
        setDiplomas(diplomasRes.data);
        setUniversities(universitiesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const fetchUniversityData = useCallback(async (universityId: string) => {
    setLoading(true);
    try {
      const [studentsRes, diplomasRes] = await Promise.all([
        fetchStudentsByUniversity(universityId),
        fetchDiplomasByUniversity(universityId),
      ]);
      
      return {
        universityStudents: studentsRes.data,
        universityDiplomas: diplomasRes.data,
      };
    } catch (error) {
      console.error('Error fetching university specific data:', error);
      return { universityStudents: [], universityDiplomas: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    students,
    users,
    diplomas,
    universities,
    loading,
    fetchUniversityData,
  };
}