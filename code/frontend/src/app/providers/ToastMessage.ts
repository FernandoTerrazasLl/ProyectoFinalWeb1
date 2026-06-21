export interface ToastMessage {
  id: string;
  tone: "success" | "error" | "info";
  message: string;
}
