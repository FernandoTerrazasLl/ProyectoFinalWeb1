import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import { updateProviderProfile } from "@entities/psychologist";
import type { EditProviderProfileProps } from "@features/edit-provider-profile/ui/EditProviderProfileProps";
import editProviderProfileTemplate from "@features/edit-provider-profile/ui/EditProviderProfile.hbs?raw";
import "@features/edit-provider-profile/ui/EditProviderProfile.css";

const MAX_TAGS = 5;

export class EditProviderProfile extends Block<EditProviderProfileProps> {
  protected template = editProviderProfileTemplate;
  private tags: string[] = [];
  private avatarUrl = "";
  protected events: EventListType = {
    keydown: (event) => this.handleTagKeydown(event as KeyboardEvent),
    click: (event) => this.handleClick(event),
    change: (event) => this.handlePhotoChange(event),
    submit: (event) => {
      event.preventDefault();
      void this.save();
    },
  };

  protected componentDidMount() {
    if (this.props.saved)
      return;

    (this.refs.firstName as HTMLInputElement).value = this.props.draft.firstName;
    (this.refs.lastName as HTMLInputElement).value = this.props.draft.lastName;
    (this.refs.maternalLastName as HTMLInputElement).value = this.props.draft.maternalLastName;
    (this.refs.ci as HTMLInputElement).value = this.props.draft.ci;
    (this.refs.birthDate as HTMLInputElement).value = this.props.draft.birthDate;
    (this.refs.gender as HTMLInputElement).value = this.props.draft.gender;
    (this.refs.phoneNumber as HTMLInputElement).value = this.props.draft.phoneNumber;
    (this.refs.email as HTMLInputElement).value = this.props.draft.email;
    (this.refs.bio as HTMLTextAreaElement).value = this.props.draft.bio;
    (this.refs.rate as HTMLInputElement).value = String(this.props.draft.sessionPrice);
    (this.refs.specialty as HTMLInputElement).value = this.props.draft.specialty;
    (this.refs.officeAddress as HTMLInputElement).value = this.props.draft.officeAddress;
    this.avatarUrl = this.props.draft.avatarUrl;
    this.setAvatarInitial();
    this.tags = [...this.props.draft.tags];
    this.renderChips();
  }

  private setAvatarInitial() {
    const initial = this.props.draft.firstName.trim().charAt(0).toUpperCase() || "P";
    const element = this.refs.avatarInitial as HTMLElement | undefined;
    const preview = this.refs.avatarPreview as HTMLImageElement | undefined;

    if (element)
      element.textContent = initial;
    if (element && preview && preview.getAttribute("src"))
      element.style.display = "none";
  }

  private handleTagKeydown(event: KeyboardEvent) {
    if (event.key !== "Enter")
      return;

    event.preventDefault();
    const input = this.refs.tagInput as HTMLInputElement;
    const value = input.value.trim();

    if (this.tags.length >= MAX_TAGS) {
      this.setLimitMessage(`Alcanzaste el máximo de ${MAX_TAGS} etiquetas.`);
      return;
    }

    if (value && !this.tags.includes(value)) {
      this.tags.push(value);
      input.value = "";
      this.renderChips();
    }
  }

  private handleClick(event: Event) {
    const target = event.target as Element;

    if (target.closest(".edit-provider-profile__photo-button")) {
      (this.refs.avatarInput as HTMLInputElement).click();
      return;
    }

    this.handleRemoveTag(event);
  }

  private handleRemoveTag(event: Event) {
    const removeButton = (event.target as Element).closest("[data-tag]");

    if (!removeButton)
      return;

    this.tags = this.tags.filter((tag) => tag !== removeButton.getAttribute("data-tag"));
    this.setLimitMessage("");
    this.renderChips();
  }

  private renderChips() {
    this.refs.chips?.replaceChildren(...this.tags.map((tag) => this.createChip(tag)));
  }

  private createChip(tag: string): Element {
    const chip = document.createElement("span");
    chip.className = "edit-provider-profile__chip";
    chip.textContent = tag;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "edit-provider-profile__remove";
    removeButton.dataset.tag = tag;
    removeButton.setAttribute("aria-label", `Quitar ${tag}`);
    removeButton.textContent = "×";
    chip.append(removeButton);
    
    return chip;
  }

  private setLimitMessage(message: string) {
    if (this.refs.limit)
      this.refs.limit.textContent = message;
  }

  private handlePhotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024)
      return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const preview = this.refs.avatarPreview as HTMLImageElement;
      const initial = this.refs.avatarInitial as HTMLElement;

      this.avatarUrl = String(reader.result);
      preview.src = this.avatarUrl;
      preview.style.display = "block";
      initial.style.display = "none";
    });
    reader.readAsDataURL(file);
  }

  private async save() {
    const result = await updateProviderProfile({
      firstName: (this.refs.firstName as HTMLInputElement).value,
      lastName: (this.refs.lastName as HTMLInputElement).value,
      maternalLastName: (this.refs.maternalLastName as HTMLInputElement).value,
      ci: (this.refs.ci as HTMLInputElement).value,
      birthDate: (this.refs.birthDate as HTMLInputElement).value,
      gender: (this.refs.gender as HTMLInputElement).value,
      phoneNumber: (this.refs.phoneNumber as HTMLInputElement).value,
      email: (this.refs.email as HTMLInputElement).value,
      avatarUrl: this.avatarUrl,
      bio: (this.refs.bio as HTMLTextAreaElement).value,
      sessionPrice: Number((this.refs.rate as HTMLInputElement).value),
      tags: this.tags,
      specialty: (this.refs.specialty as HTMLInputElement).value,
      officeAddress: (this.refs.officeAddress as HTMLInputElement).value,
    });

    if (result.isOk())
      this.setProps({ saved: true });
  }
}
