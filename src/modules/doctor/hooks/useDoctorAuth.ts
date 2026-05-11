// Convenience re-export so imports stay clean throughout the doctor module.
// Usage: import { useDoctorAuth } from '@/modules/doctor/hooks/useDoctorAuth';
export { useDoctorAuth } from '../context/DoctorAuthContext';
export type { } from '../types/doctorProfile'; // re-export types via context barrel
