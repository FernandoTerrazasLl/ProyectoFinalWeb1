import Handlebars from "handlebars";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { BlockChild } from "@shared/lib/block/BlockChild";
import type { EventListType } from "@shared/lib/block/EventListType";

export abstract class Block<Props extends BlockOwnProps = BlockOwnProps> {
  protected abstract template: string;
  protected props: Props;
  protected children: Block[] = [];
  protected refs: Record<string, Element> = {};
  protected events: EventListType = {};
  private domElement: Element | null = null;

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  element(): Element | null {
    if (!this.domElement) 
      this.render();

    return this.domElement;
  }

  setProps(partial: Partial<Props>) {
    this.props = { ...this.props, ...partial, __children: [], __refs: {} } as Props;
    this.render();
  }

  protected componentDidMount() {}

  protected componentWillUnmount() {}

  protected mountInto(refName: string, child: Block) {
    const slot = this.refs[refName];
    const element = child.element();

    if (slot && element)
      slot.replaceWith(element);
  }

  protected render() {
    this.unmount();
    const next = this.compile();

    if (this.domElement && next)
      this.domElement.replaceWith(next);

    this.domElement = next;

    if (!next)
      return;

    this.toggleListeners("addEventListener");
    this.componentDidMount();
  }

  private unmount() {
    if (!this.domElement) 
      return;

    this.children.reverse().forEach((child) => child.unmount());
    this.componentWillUnmount();
    this.toggleListeners("removeEventListener");
  }

  private toggleListeners(method: "addEventListener" | "removeEventListener") {
    const element = this.domElement;

    if (!element) 
      return;

    for (const name in this.events) {
      const handler = this.events[name as keyof EventListType];

      if (handler) 
        element[method](name, handler);
    }
  }

  private compile(): Element | null {
    const template = document.createElement("template");
    template.innerHTML = Handlebars.compile(this.template)(this.props);
    const fragment = template.content;

    const children: BlockChild[] = this.props.__children ?? [];
    this.children = children.map((child: BlockChild) => child.component);

    for (const child of children) {
      const embedded = child.embed(fragment);

      if (embedded.isErr()) 
        return null;
    }

    this.refs = { ...this.props.__refs };

    fragment.querySelectorAll("[ref]").forEach((element) => {
      const name = element.getAttribute("ref");

      if (name) {
        this.refs[name] = element;
        element.removeAttribute("ref");
      }
    });

    return fragment.firstElementChild;
  }
}
