import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { EditProviderProfile } from "@features/edit-provider-profile";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { getMyProviderProfile } from "@entities/psychologist";
import providerSettingsPageTemplate from "@pages/provider-settings/ProviderSettingsPage.hbs?raw";
import "@pages/provider-settings/ProviderSettingsPage.css";

export class ProviderSettingsPage extends Block<BlockOwnProps> {
  protected template = providerSettingsPageTemplate;

  protected componentDidMount() {
    this.mountInto("form", new Spinner({}));
    void this.loadProfile();
  }

  private async loadProfile() {
    const result = await getMyProviderProfile();

    if (result.isErr()) {
      this.mountInto("form", new EmptyState({ title: "No pudimos cargar tu perfil" }));
      return;
    }

    this.mountInto("form", new EditProviderProfile({ draft: result.value }));
  }
}
