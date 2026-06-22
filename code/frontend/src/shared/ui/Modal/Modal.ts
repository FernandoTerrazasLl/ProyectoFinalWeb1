import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { ModalProps } from "@shared/ui/Modal/ModalProps";
import modalTemplate from "@shared/ui/Modal/Modal.hbs?raw";
import "@shared/ui/Modal/Modal.css";

export class Modal extends Block<ModalProps> {
  protected template = modalTemplate;
  protected events: EventListType = {
    click: (event) => {
      const target = event.target as Element;

      if (target.closest(".modal__close") || !target.closest(".modal__dialog"))
        this.close();
    },
  };

  protected componentDidMount() {
    this.mountInto("body", this.props.body);
  }

  private close() {
    this.element()?.remove();
    this.props.onClose();
  }
}
