import { LayoutMetrics } from "@/positioning/vertical/LayoutMetrics";
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";

export interface LayoutRuntime {
  metrics: LayoutMetrics;
  markdown: MarkdownMeasurer;
}

import { StatementVM } from "./StatementVM";

export type BlockLayout = {
  tops: number[];
  endTop: number;
  statements: StatementVM[];
};
