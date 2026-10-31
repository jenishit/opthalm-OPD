// Generic response envelope the Go backend wraps every response in.
// Success: { success, message, data }. Error: { success: false, messages: [] }.

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  messages: string[];
}
