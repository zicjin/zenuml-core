import { CONDITION_LABEL_HEIGHT } from "./FragmentMetrics";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";
import { BlockVM } from "./BlockVM";
import { StatementVM } from "./StatementVM";
import {
  FRAGMENT_HEADER_HEIGHT,
  FRAGMENT_MARGIN,
} from "@/positioning/Constants";

export class FragmentLoopVM extends FragmentVM {
  constructor(
    statement: any,
    private readonly loop: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  protected fragmentBodyHeight(fragmentOrigin: string): number {
    let height = 0;
    if (this.loop?.parExpr?.()?.condition?.()) {
      height += CONDITION_LABEL_HEIGHT;
    }
    const nestedBlock = this.loop?.braceBlock?.()?.block?.();
    height += this.blockHeight(nestedBlock, fragmentOrigin);
    return height;
  }

  public readonly kind = "loop";

  protected traverseNested(
    origin: string,
    startTop: number,
    visitor: (statement: StatementVM, top: number) => void,
  ): void {
    const fragmentOrigin = this.resolveFragmentOrigin(origin);
    let currentTop = startTop + FRAGMENT_HEADER_HEIGHT + FRAGMENT_MARGIN;

    if (this.loop?.parExpr?.()?.condition?.()) {
      currentTop += CONDITION_LABEL_HEIGHT;
    }
    const nestedBlock = this.loop?.braceBlock?.()?.block?.();
    if (nestedBlock) {
      const blockVM = new BlockVM(nestedBlock, this.runtime);
      blockVM.traverse(fragmentOrigin, currentTop, visitor);
    }
  }
}
