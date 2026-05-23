import { request } from './api';

export const PatientService = {
  getPatients: async (token: string) => {
    return request('/doctor/patients', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getPatientDetail: async (token: string, patientId: string) => {
    return request(`/doctor/patients/${patientId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  updatePatient: async (token: string, patientId: string, data: any) => {
    return request(`/doctor/patients/${patientId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  },
};
