/**
 * Server-side layout pass that mirrors the per-pixel measurements the browser would
 * normally perform. The goal is to deterministically derive the vertical positions
 * of every statement (messages, fragments, dividers, etc.) using only parser context
 * and Theme metrics so that Playwright or any other DOM engine is no longer needed
 * in rendering tests.
 */
import { WidthFunc } from "@/positioning/Coordinate";
import { MarkdownMeasurer } from "@/positioning/vertical/MarkdownMeasurer";
import {
  getLayoutMetrics,
  LayoutMetrics,
  ThemeName,
} from "@/positioning/vertical/LayoutMetrics";
import {
  createStatementKey,
  StatementKey,
} from "@/positioning/vertical/StatementIdentifier";
import {
  StatementAnchor,
  StatementKind,
} from "@/positioning/vertical/StatementTypes";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { BlockVM } from "./vertical/vm/BlockVM";
import { StatementVM } from "./vertical/vm/StatementVM";
import { CreationStatementVM } from "./vertical/vm/CreationStatementVM";

/**
 * Cached measurements for one statement. `top` is relative to the block that
 * owns the statement and `height` is the total vertical span. `anchors` exposes
 * important vertical reference points (message line, occurrence top, etc.) so
 * consumers can align other layers, while `meta` carries debugging telemetry to
 * cross-check browser results.
 */
interface StatementCoordinate {
  top: number;
  height: number;
  kind: StatementKind;
  anchors?: Partial<Record<StatementAnchor, number>>;
  meta?: Record<string, number>;
}

/**
 * Constructor parameters required to detach layout from the browser. We feed the
 * parser root context, a text width measuring function (mirroring canvas measureText
 * in the browser), the theme-driven spacing metrics, and the participant ordering so
 * async fragment traversals can infer their origin.
 */
interface VerticalCoordinatesOptions {
  rootContext: any;
  widthProvider: WidthFunc;
  theme?: ThemeName;
  originParticipant: string;
  participantOrder: string[];
}

/**
 * Walks the parsed AST and deterministically assigns vertical coordinates to every
 * statement. The recursion mirrors how the renderer stacks statements inside blocks
 * and fragments so the resulting heights match what Playwright would capture from
 * the DOM.
 */
export class VerticalCoordinates {
  private readonly metrics: LayoutMetrics;
  private readonly statementMap = new Map<StatementKey, StatementCoordinate>();
  private readonly markdownMeasurer: MarkdownMeasurer;
  private readonly creationTopByParticipant = new Map<string, number>();
  private readonly rootBlock: any;
  private readonly rootOrigin: string;
  readonly totalHeight: number;

  /**
   * Build the measurement helpers up-front and immediately walk the root block so
   * that `totalHeight` and the internal lookup tables are populated for callers.
   */
  constructor(options: VerticalCoordinatesOptions) {
    this.metrics = getLayoutMetrics(options.theme);
    this.markdownMeasurer = new MarkdownMeasurer(
      this.metrics,
      options.widthProvider,
    );
    this.rootBlock = options.rootContext?.block?.() ?? options.rootContext;
    this.rootOrigin = options.originParticipant || _STARTER_;

    const rootVM = new BlockVM(this.rootBlock, {
      metrics: this.metrics,
      markdown: this.markdownMeasurer,
    });

    const start = this.metrics.messageLayerPaddingTop;
    // Calculate total height first
    this.totalHeight =
      rootVM.height(this.rootOrigin) +
      start +
      this.metrics.messageLayerPaddingBottom;

    // Traverse and populate map
    rootVM.traverse(this.rootOrigin, start, (statementVM, top) => {
      const height = statementVM.height(this.rootOrigin);
      const kind = statementVM.kind as StatementKind;
      const anchors = statementVM.getAnchors(this.rootOrigin) as Partial<
        Record<StatementAnchor, number>
      >;

      const key = createStatementKey(statementVM.context);
      this.statementMap.set(key, {
        top,
        height,
        kind,
        anchors,
      });

      if (statementVM instanceof CreationStatementVM) {
        const creation = statementVM.context.creation();
        const target = creation?.Owner?.();
        if (target) {
          const messageTop = anchors.message;
          if (messageTop !== undefined) {
            const prevTop = this.creationTopByParticipant.get(target);
            if (prevTop == null || messageTop < prevTop) {
              this.creationTopByParticipant.set(target, messageTop);
            }
          }
        }
      }
    });
  }

  getStatementTop(keyOrCtx: StatementKey | any): number | undefined {
    const key =
      typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.top;
  }

  getStatementHeight(keyOrCtx: StatementKey | any): number | undefined {
    const key =
      typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.height;
  }

  getStatementAnchors(
    keyOrCtx: StatementKey | any,
  ): Partial<Record<StatementAnchor, number>> | undefined {
    const key =
      typeof keyOrCtx === "string" ? keyOrCtx : createStatementKey(keyOrCtx);
    return this.statementMap.get(key)?.anchors;
  }

  getCreationTop(participant: string): number | undefined {
    return this.creationTopByParticipant.get(participant);
  }

  getMessageLayerPaddingTop(): number {
    return this.metrics.messageLayerPaddingTop;
  }

  getStatementMarginTop(): number {
    return this.metrics.statementMarginTop;
  }

  getLifelineLayerPaddingTop(): number {
    return this.metrics.lifelineLayerPaddingTop;
  }

  entries() {
    return Array.from(this.statementMap.entries());
  }
}
