import {
  CREATION_MESSAGE_HEIGHT,
  STATEMENT_CONTAINER_MARGIN,
} from "@/positioning/Constants";
import { getCommentHeight } from "./getCommentHeight";
import { StatementVM } from "./StatementVM";
import type { LayoutRuntime } from "./types";

export class CreationStatementVM extends StatementVM {
  constructor(
    statement: any,
    private readonly creation: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  protected heightAfterComment(origin: string): number {
    const target = this.creation?.Owner?.() || origin;
    const nestedBlock = this.creation?.braceBlock?.()?.block?.();
    const nestedHeight = this.blockHeight(nestedBlock, target);
    return CREATION_MESSAGE_HEIGHT + nestedHeight;
  }

  public getAnchors(origin: string): Record<string, number> {
    const commentHeight = getCommentHeight(this.context, this.runtime.markdown);
    const messageTop = STATEMENT_CONTAINER_MARGIN + commentHeight;
    const occurrenceTop = messageTop + CREATION_MESSAGE_HEIGHT;
    const anchors: Record<string, number> = {
      message: messageTop,
      occurrence: occurrenceTop,
    };
    // TODO: Add return anchor if assignment exists
    return anchors;
  }

  public readonly kind = "creation";
}
