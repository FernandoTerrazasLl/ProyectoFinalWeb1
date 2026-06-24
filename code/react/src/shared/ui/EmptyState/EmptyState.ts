import { Block } from "@shared/lib/block/Block";
import type { EmptyStateProps } from "@shared/ui/EmptyState/EmptyStateProps";
import emptyStateTemplate from "@shared/ui/EmptyState/EmptyState.hbs?raw";
import "@shared/ui/EmptyState/EmptyState.css";

export class EmptyState extends Block<EmptyStateProps> {
  static componentName = "EmptyState";
  protected template = emptyStateTemplate;
}
