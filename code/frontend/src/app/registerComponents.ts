import { ComponentRegistry } from "@shared/lib/block/ComponentRegistry";
import { Button } from "@shared/ui/Button/Button";
import { Input } from "@shared/ui/Input/Input";

export function registerComponents() {
  ComponentRegistry.register(Button);
  ComponentRegistry.register(Input);
}
