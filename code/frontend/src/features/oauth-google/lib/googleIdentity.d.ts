interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdentityConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonOptions {
  type: "standard";
  theme: "outline";
  text: "continue_with";
  width: number;
}

interface GoogleIdentityApi {
  initialize: (config: GoogleIdentityConfig) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
}

interface Window {
  google?: { accounts: { id: GoogleIdentityApi } };
}
