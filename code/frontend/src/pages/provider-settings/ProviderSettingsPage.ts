import { Block } from "@shared/lib/block/Block";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import { EditProviderProfile } from "@features/edit-provider-profile";
import { ProviderAvailabilitySettings } from "@features/provider-availability-settings";
import { DashboardSidebar } from "@widgets/dashboard-sidebar";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { getMyProviderProfile } from "@entities/psychologist";
import providerSettingsPageTemplate from "@pages/provider-settings/ProviderSettingsPage.hbs?raw";
import "@pages/provider-settings/ProviderSettingsPage.css";

interface ProviderSettingsPageProps extends BlockOwnProps {
  active?: "profile" | "configuration";
  isConfiguration?: boolean;
}

export class ProviderSettingsPage extends Block<ProviderSettingsPageProps> {
  protected template = providerSettingsPageTemplate;

  constructor(props: ProviderSettingsPageProps) {
    super({ ...props, isConfiguration: props.active === "configuration" });
  }

  protected componentDidMount() {
    this.mountInto("sidebar", new DashboardSidebar({ active: this.props.active ?? "profile" }));

    if (this.props.active === "configuration") {
      this.mountInto("form", new ProviderAvailabilitySettings({}));
      return;
    }

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
