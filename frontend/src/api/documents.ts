import apiClient from './client';
import {
  Document, DocumentPage, ChecklistItem, SearchResult,
  QuestionAnswerResult, DashboardStats, ApiResponse
} from '../types';

export async function getDashboardStats() {
  const res = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  return res.data;
}

export async function uploadDocument(formData: FormData) {
  const res = await apiClient.post<ApiResponse<{ document: Document; extraction: any }>>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function listDocuments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  extractionStatus?: string;
  reviewStatus?: string;
}) {
  const res = await apiClient.get<ApiResponse<{ documents: Document[] }>>('/documents', { params });
  return res.data;
}

export async function getDocument(id: string) {
  const res = await apiClient.get<ApiResponse<{ document: Document }>>(`/documents/${id}`);
  return res.data;
}

export async function getDocumentPages(id: string) {
  const res = await apiClient.get<ApiResponse<{ pages: DocumentPage[] }>>(`/documents/${id}/pages`);
  return res.data;
}

export async function deleteDocument(id: string) {
  const res = await apiClient.delete<ApiResponse<null>>(`/documents/${id}`);
  return res.data;
}

export async function searchDocument(id: string, query: string) {
  const res = await apiClient.get<ApiResponse<{ results: SearchResult[]; query: string; resultCount: number }>>(
    `/documents/${id}/search`,
    { params: { q: query } }
  );
  return res.data;
}

export async function askQuestion(id: string, question: string) {
  const res = await apiClient.post<ApiResponse<QuestionAnswerResult>>(`/documents/${id}/ask`, { question });
  return res.data;
}

export async function runChecklist(id: string) {
  const res = await apiClient.post<ApiResponse<{ results: any[]; disclaimer: string }>>(`/documents/${id}/checklist`);
  return res.data;
}

export async function getChecklistResults(id: string) {
  const res = await apiClient.get<ApiResponse<{ items: ChecklistItem[] }>>(`/documents/${id}/checklist`);
  return res.data;
}

export async function updateChecklistItem(
  docId: string,
  itemId: string,
  data: { reviewerNotes?: string; detectionStatus?: string }
) {
  const res = await apiClient.patch<ApiResponse<{ item: ChecklistItem }>>(
    `/documents/${docId}/checklist/${itemId}`,
    data
  );
  return res.data;
}
