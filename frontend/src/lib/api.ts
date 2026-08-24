/**
 * Centralized API Client Module for Yogya Frontend
 * Handles HTTP requests to the FastAPI backend (/api/v1)
 */

import { DeclarationField, InspectionReport, ProductSummary } from '../types';

export type { DeclarationField, ProductSummary };

const TOKEN_KEY = 'yogya_jwt_token';

export const getApiBaseUrl = (): string => {
  return (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
};

export const getBackendHost = (): string => {
  const baseUrl = getApiBaseUrl();
  return baseUrl.replace(/\/api\/v1\/?$/, '');
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const resolveImageUrl = (previewUrl?: string): string => {
  if (!previewUrl) return '';
  if (previewUrl.startsWith('http://') || previewUrl.startsWith('https://') || previewUrl.startsWith('data:')) {
    return previewUrl;
  }
  const host = getBackendHost();
  const cleanUrl = previewUrl.startsWith('/') ? previewUrl : `/${previewUrl}`;
  return `${host}${cleanUrl}`;
};

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface DashboardStats {
  totalInspections: number;
  compliantCount: number;
  needsReviewCount: number;
  nonCompliantCount: number;
  inconclusiveCount: number;
  complianceRate: number;
  recentInspections: InspectionReport[];
  violationCategories: Record<string, number>;
}

export interface OCRBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRTextRegion {
  id: string;
  job_id: string;
  inspection_id: string;
  evidence_image_id?: string | null;
  recognized_text: string;
  confidence: number;
  bbox: OCRBoundingBox;
  line_number: number;
  word_number: number;
}

export interface OCRJobStatusResponse {
  id: string;
  job_id: string;
  inspection_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | string;
  engine_used: string;
  progress: number;
  processing_time_ms: number;
  error_message?: string | null;
  created_at: number;
  updated_at: number;
}

export interface OCRResultsResponse {
  id: string;
  job_id: string;
  inspection_id: string;
  status: string;
  raw_text: string;
  average_confidence: number;
  processing_time_ms: number;
  regions: OCRTextRegion[];
  error_message?: string | null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type to application/json unless sending FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    if (netErr instanceof ApiError) throw netErr;
    throw new ApiError(
      `Network failure: Unable to connect to backend server at ${baseUrl}. Please check that the server is running.`,
      0
    );
  }

  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      alert('Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} error`;
    try {
      const errData = await response.json();
      if (typeof errData.detail === 'string') {
        errorDetail = errData.detail;
      } else if (Array.isArray(errData.detail)) {
        errorDetail = errData.detail.map((e: any) => `${e.loc?.join('.') || 'field'}: ${e.msg}`).join('; ');
      } else if (errData.message) {
        errorDetail = errData.message;
      }
    } catch {
      // JSON parse failed
    }
    throw new ApiError(`Backend error (${response.status}): ${errorDetail}`, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Authentication Endpoints
  async login(username: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (data.access_token) {
      setToken(data.access_token);
    }
    return data;
  },

  async register(email: string, password: string, fullName: string, role: string = 'officer'): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });

    if (data.access_token) {
      setToken(data.access_token);
    }
    return data;
  },

  async getMe(): Promise<UserProfile> {
    return request<UserProfile>('/auth/me');
  },

  // Inspections Endpoints
  async getInspections(params: { status?: string; search?: string; page?: number; limit?: number } = {}): Promise<InspectionReport[]> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const reports = await request<InspectionReport[]>(`/inspections${queryString}`);
    
    // Normalize image URLs in evidenceImages
    return reports.map(r => ({
      ...r,
      evidenceImages: (r.evidenceImages || []).map(img => ({
        ...img,
        previewUrl: resolveImageUrl(img.previewUrl)
      }))
    }));
  },

  async getInspectionById(id: string): Promise<InspectionReport> {
    const report = await request<InspectionReport>(`/inspections/${id}`);
    return {
      ...report,
      evidenceImages: (report.evidenceImages || []).map(img => ({
        ...img,
        previewUrl: resolveImageUrl(img.previewUrl)
      }))
    };
  },

  async createInspection(files: File[], metadata: { productName?: string; manufacturer?: string } = {}): Promise<InspectionReport> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (metadata.productName) formData.append('productName', metadata.productName);
    if (metadata.manufacturer) formData.append('manufacturer', metadata.manufacturer);

    const report = await request<InspectionReport>('/inspections', {
      method: 'POST',
      body: formData,
    });

    return {
      ...report,
      evidenceImages: (report.evidenceImages || []).map(img => ({
        ...img,
        previewUrl: resolveImageUrl(img.previewUrl)
      }))
    };
  },

  async updateInspection(id: string, patchData: Partial<InspectionReport>): Promise<InspectionReport> {
    const report = await request<InspectionReport>(`/inspections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patchData),
    });

    return {
      ...report,
      evidenceImages: (report.evidenceImages || []).map(img => ({
        ...img,
        previewUrl: resolveImageUrl(img.previewUrl)
      }))
    };
  },

  async deleteInspection(id: string): Promise<void> {
    await request<void>(`/inspections/${id}`, {
      method: 'DELETE',
    });
  },

  // OCR Pipeline Endpoints
  async processOCR(inspectionId: string): Promise<OCRJobStatusResponse> {
    return request<OCRJobStatusResponse>(`/inspections/${inspectionId}/process-ocr`, {
      method: 'POST',
    });
  },

  async getOCRStatus(inspectionId: string): Promise<OCRJobStatusResponse> {
    return request<OCRJobStatusResponse>(`/inspections/${inspectionId}/ocr-status`);
  },

  async getOCRResults(inspectionId: string): Promise<OCRResultsResponse> {
    return request<OCRResultsResponse>(`/inspections/${inspectionId}/ocr-results`);
  },

  // Products Endpoints
  async getProducts(): Promise<ProductSummary[]> {
    const products = await request<ProductSummary[]>('/products');
    return products.map(p => ({
      ...p,
      sampleImage: p.sampleImage ? {
        ...p.sampleImage,
        previewUrl: resolveImageUrl(p.sampleImage.previewUrl)
      } : undefined,
      inspections: (p.inspections || []).map(r => ({
        ...r,
        evidenceImages: (r.evidenceImages || []).map(img => ({
          ...img,
          previewUrl: resolveImageUrl(img.previewUrl)
        }))
      }))
    }));
  },

  async getProductByName(name: string): Promise<ProductSummary> {
    const product = await request<ProductSummary>(`/products/${encodeURIComponent(name)}`);
    return {
      ...product,
      sampleImage: product.sampleImage ? {
        ...product.sampleImage,
        previewUrl: resolveImageUrl(product.sampleImage.previewUrl)
      } : undefined,
      inspections: (product.inspections || []).map(r => ({
        ...r,
        evidenceImages: (r.evidenceImages || []).map(img => ({
          ...img,
          previewUrl: resolveImageUrl(img.previewUrl)
        }))
      }))
    };
  },

  // Dashboard Endpoint
  async getDashboardStats(): Promise<DashboardStats> {
    const stats = await request<DashboardStats>('/dashboard/stats');
    return {
      ...stats,
      recentInspections: (stats.recentInspections || []).map(r => ({
        ...r,
        evidenceImages: (r.evidenceImages || []).map(img => ({
          ...img,
          previewUrl: resolveImageUrl(img.previewUrl)
        }))
      }))
    };
  }
};

