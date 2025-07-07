// Geral
export type ID = string;

// ApiResponse padrão
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Padrão de autenticação
export interface AuthToken {
  token: string;
  expiresIn: number;
}

// Request Padrão para endpoints
export interface RequestParams {
  headers?: { [key: string]: string };
  query?: { [key: string]: string | number };
  body?: any;
}
