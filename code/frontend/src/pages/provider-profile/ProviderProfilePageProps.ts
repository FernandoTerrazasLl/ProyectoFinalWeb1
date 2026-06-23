import type { BlockOwnProps } from "@shared/lib/block/BlockOwnProps";
import type { Psychologist } from "@entities/psychologist";

export interface ProviderProfilePageProps extends BlockOwnProps {
  id: string;
  psychologist?: Psychologist;
  notFound?: boolean;
}
