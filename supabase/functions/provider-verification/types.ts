
export interface ProviderData {
  id: string;
  business_name: string;
  verification_status: string;
  created_at: string;
}

export interface DocumentData {
  id: string;
  type: string;
  status: string;
  created_at: string;
}

export interface VerificationResponse {
  success: boolean;
  status?: string;
  provider?: ProviderData;
  documents?: DocumentData[];
  message: string;
}

export interface ApplicationResponse {
  success: boolean;
  provider_id?: string;
  status?: string;
  auto_approved?: boolean;
  message: string;
}

export interface UploadedDocument {
  path: string;
  type: string;
}
