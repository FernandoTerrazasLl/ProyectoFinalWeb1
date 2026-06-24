import Handlebars from "handlebars";
import type { HelperOptions } from "handlebars";
import { Ok, Err } from "ts-results-es";
import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { ComponentClass } from "@shared/lib/block/ComponentClass";

export class ComponentRegistry {
  private static nextPlaceholderId = 0;

  static register<Props extends BlockOwnProps>(Component: ComponentClass<Props>) {
    Handlebars.registerHelper(Component.componentName, (options: HelperOptions): string => {
      const hash = options.hash as Props & { ref?: string };
      const root = options.data.root as BlockOwnProps;
      const attribute = `data-component-hbs-id="${(ComponentRegistry.nextPlaceholderId += 1)}"`;
      const component = new Component(hash);

      if (hash.ref) {
        const refs = (root.__refs ??= {});
        const element = component.element();

        if (element) 
          refs[hash.ref] = element;
      }

      const children = (root.__children ??= []);
      
      children.push({
        component,
        embed(fragment: DocumentFragment) {
          const placeholder = fragment.querySelector(`[${attribute}]`);
          const element = component.element();

          if (!placeholder || !element) 
            return Err(`Cannot embed ${Component.componentName}`);

          placeholder.replaceWith(element);

          return Ok(undefined);
        },
      });

      return `<div ${attribute}></div>`;
    });
  }
}
