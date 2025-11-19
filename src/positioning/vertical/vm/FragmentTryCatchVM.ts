import {
  CONDITION_LABEL_HEIGHT,
  FRAGMENT_SEGMENT_MARGIN,
} from "./FragmentMetrics";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";
import { toArray } from "./toArray";
import { BlockVM } from "./BlockVM";
import { StatementVM } from "./StatementVM";
import {
  FRAGMENT_HEADER_HEIGHT,
  FRAGMENT_MARGIN,
} from "@/positioning/Constants";

export class FragmentTryCatchVM extends FragmentVM {
  constructor(
    statement: any,
    private readonly tcf: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  protected fragmentBodyHeight(fragmentOrigin: string): number {
    let height = 0;

    const tryBlock = this.tcf?.tryBlock?.()?.braceBlock?.()?.block?.();
    height += this.blockHeight(tryBlock, fragmentOrigin);

    const catchBlocks = toArray(this.tcf?.catchBlock?.());
    catchBlocks.forEach((catchBlock: any) => {
      height += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      const block = catchBlock?.braceBlock?.()?.block?.();
      height += this.blockHeight(block, fragmentOrigin);
    });

    const finallyBlock = this.tcf?.finallyBlock?.()?.braceBlock?.()?.block?.();
    if (finallyBlock) {
      height += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      height += this.blockHeight(finallyBlock, fragmentOrigin);
    }

    return height;
  }

  public readonly kind = "tcf";

  protected traverseNested(
    origin: string,
    startTop: number,
    visitor: (statement: StatementVM, top: number) => void,
  ): void {
    const fragmentOrigin = this.resolveFragmentOrigin(origin);
    let currentTop = startTop + FRAGMENT_HEADER_HEIGHT + FRAGMENT_MARGIN;

    const tryBlock = this.tcf?.tryBlock?.()?.braceBlock?.()?.block?.();
    if (tryBlock) {
      const blockVM = new BlockVM(tryBlock, this.runtime);
      blockVM.traverse(fragmentOrigin, currentTop, visitor);
      currentTop += blockVM.height(fragmentOrigin);
    }

    const catchBlocks = toArray(this.tcf?.catchBlock?.());
    catchBlocks.forEach((catchBlock: any) => {
      currentTop += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      const block = catchBlock?.braceBlock?.()?.block?.();
      if (block) {
        const blockVM = new BlockVM(block, this.runtime);
        blockVM.traverse(fragmentOrigin, currentTop, visitor);
        currentTop += blockVM.height(fragmentOrigin);
      }
    });

    const finallyBlock = this.tcf?.finallyBlock?.()?.braceBlock?.()?.block?.();
    if (finallyBlock) {
      currentTop += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      const blockVM = new BlockVM(finallyBlock, this.runtime);
      blockVM.traverse(fragmentOrigin, currentTop, visitor);
    }
  }
}
