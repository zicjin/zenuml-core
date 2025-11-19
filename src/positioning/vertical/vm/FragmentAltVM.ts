import {
  CONDITION_LABEL_HEIGHT,
  FRAGMENT_SEGMENT_MARGIN,
} from "./FragmentMetrics";
import {
  FRAGMENT_HEADER_HEIGHT,
  FRAGMENT_MARGIN,
} from "@/positioning/Constants";
import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";
import { toArray } from "./toArray";
import { BlockVM } from "./BlockVM";
import { StatementVM } from "./StatementVM";

export class FragmentAltVM extends FragmentVM {
  constructor(
    statement: any,
    private readonly alt: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  protected fragmentBodyHeight(fragmentOrigin: string): number {
    let height = 0;

    const ifBlock = this.alt?.ifBlock?.()?.braceBlock?.()?.block?.();
    if (ifBlock) {
      height += CONDITION_LABEL_HEIGHT;
      height += this.blockHeight(ifBlock, fragmentOrigin);
    }

    const elseIfBlocks = toArray(this.alt?.elseIfBlock?.());
    elseIfBlocks.forEach((elseIfBlock: any) => {
      height += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      const block = elseIfBlock?.braceBlock?.()?.block?.();
      height += this.blockHeight(block, fragmentOrigin);
    });

    const elseBlock = this.alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      height += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      height += this.blockHeight(elseBlock, fragmentOrigin);
    }

    return height;
  }

  public readonly kind = "alt";

  protected traverseNested(
    origin: string,
    startTop: number,
    visitor: (statement: StatementVM, top: number) => void,
  ): void {
    const fragmentOrigin = this.resolveFragmentOrigin(origin);
    let currentTop = startTop + FRAGMENT_HEADER_HEIGHT + FRAGMENT_MARGIN;

    const ifBlock = this.alt?.ifBlock?.()?.braceBlock?.()?.block?.();
    if (ifBlock) {
      currentTop += CONDITION_LABEL_HEIGHT;
      const blockVM = new BlockVM(ifBlock, this.runtime);
      blockVM.traverse(fragmentOrigin, currentTop, visitor);
      currentTop += blockVM.height(fragmentOrigin);
    }

    const elseIfBlocks = toArray(this.alt?.elseIfBlock?.());
    elseIfBlocks.forEach((elseIfBlock: any) => {
      currentTop += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      const block = elseIfBlock?.braceBlock?.()?.block?.();
      if (block) {
        const blockVM = new BlockVM(block, this.runtime);
        blockVM.traverse(fragmentOrigin, currentTop, visitor);
        currentTop += blockVM.height(fragmentOrigin);
      }
    });

    const elseBlock = this.alt?.elseBlock?.()?.braceBlock?.()?.block?.();
    if (elseBlock) {
      currentTop += FRAGMENT_SEGMENT_MARGIN + CONDITION_LABEL_HEIGHT;
      const blockVM = new BlockVM(elseBlock, this.runtime);
      blockVM.traverse(fragmentOrigin, currentTop, visitor);
      currentTop += blockVM.height(fragmentOrigin);
    }
  }
}
