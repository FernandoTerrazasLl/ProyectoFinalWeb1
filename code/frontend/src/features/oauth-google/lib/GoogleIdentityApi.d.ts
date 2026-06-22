interface GoogleIdentityApi {
  initialize: (config: GoogleIdentityConfig) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonOptions) => void;
}
