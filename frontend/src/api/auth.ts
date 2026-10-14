import apiClient from './client';
import { User, ApiResponse } from '../types';

export async function login(username: string, password: string) {
  const res = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
    username,
    password,
  });
  return res.data;
}

export async function register(data: {
  username: string;
  email: string;
  password: string;
}) {
  const res = await apiClient.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data);
  return res.data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function getMe() {
  const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
  return res.data;
}

export async function listUsers() {
  const res = await apiClient.get<ApiResponse<{ users: User[] }>>('/admin/users');
  return res.data;
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  role: string;
}) {
  const res = await apiClient.post<ApiResponse<{ user: User }>>('/admin/users', data);
  return res.data;
}

export async function updateUser(id: string, data: Partial<{ isActive: boolean; role: string; email: string }>) {
  const res = await apiClient.patch<ApiResponse<{ user: User }>>(`/admin/users/${id}`, data);
  return res.data;
}

export async function getAuditLogs(page = 1, limit = 50) {
  const res = await apiClient.get('/admin/audit-logs', { params: { page, limit } });
  return res.data;
}
