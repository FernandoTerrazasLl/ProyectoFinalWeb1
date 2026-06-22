import { ComponentRegistry } from "@shared/lib/block/ComponentRegistry";
import { Button } from "@shared/ui/Button/Button";
import { Input } from "@shared/ui/Input/Input";
import { Label } from "@shared/ui/Label/Label";
import { Spinner } from "@shared/ui/Spinner/Spinner";
import { EmptyState } from "@shared/ui/EmptyState/EmptyState";
import { Avatar } from "@shared/ui/Avatar/Avatar";
import { StarRating } from "@shared/ui/StarRating/StarRating";
import { Tag } from "@shared/ui/Tag/Tag";
import { Select } from "@shared/ui/Select/Select";
import { RangeSlider } from "@shared/ui/RangeSlider/RangeSlider";
import { ProgressBar } from "@shared/ui/ProgressBar/ProgressBar";
import { Textarea } from "@shared/ui/Textarea/Textarea";
import { Badge } from "@shared/ui/Badge/Badge";

export function registerComponents() {
  ComponentRegistry.register(Button);
  ComponentRegistry.register(Input);
  ComponentRegistry.register(Label);
  ComponentRegistry.register(Spinner);
  ComponentRegistry.register(EmptyState);
  ComponentRegistry.register(Avatar);
  ComponentRegistry.register(StarRating);
  ComponentRegistry.register(Tag);
  ComponentRegistry.register(Select);
  ComponentRegistry.register(RangeSlider);
  ComponentRegistry.register(ProgressBar);
  ComponentRegistry.register(Textarea);
  ComponentRegistry.register(Badge);
}
