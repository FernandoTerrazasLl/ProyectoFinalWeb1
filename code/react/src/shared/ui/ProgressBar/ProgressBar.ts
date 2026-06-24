import { Block } from "@shared/lib/block/Block";
import type { ProgressBarProps } from "@shared/ui/ProgressBar/ProgressBarProps";
import progressBarTemplate from "@shared/ui/ProgressBar/ProgressBar.hbs?raw";
import "@shared/ui/ProgressBar/ProgressBar.css";

export class ProgressBar extends Block<ProgressBarProps> {
  static componentName = "ProgressBar";
  protected template = progressBarTemplate;
}
