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
  protected events: EventListType = {
    keydown: (event) => this.handleTagKeydown(event as KeyboardEvent),
    click: (event) => this.handleRemoveTag(event),
    submit: (event) => {
      event.preventDefault();
      void this.save();
    },
  };

  protected componentDidMount() {
    if (this.props.saved)
      return;

    (this.refs.bio as HTMLTextAreaElement).value = this.props.draft.bio;
    (this.refs.rate as HTMLInputElement).value = String(this.props.draft.sessionPrice);
    this.tags = [...this.props.draft.tags];
    this.renderChips();
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

  private async save() {
    const result = await updateProviderProfile({
      bio: (this.refs.bio as HTMLTextAreaElement).value,
      sessionPrice: Number((this.refs.rate as HTMLInputElement).value),
      tags: this.tags,
    });

    if (result.isOk())
      this.setProps({ saved: true });
  }
}
