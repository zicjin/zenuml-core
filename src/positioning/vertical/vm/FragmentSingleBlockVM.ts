import { FragmentVM } from "./FragmentVM";
import type { LayoutRuntime } from "./types";
import { BlockVM } from "./BlockVM";
import { StatementVM } from "./StatementVM";
import {
  FRAGMENT_HEADER_HEIGHT,
  FRAGMENT_MARGIN,
} from "@/positioning/Constants";
export abstract class FragmentSingleBlockVM extends FragmentVM {
  constructor(
    statement: any,
    private readonly fragment: any,
    runtime: LayoutRuntime,
  ) {
    super(statement, runtime);
  }

  protected fragmentBodyHeight(fragmentOrigin: string): number {
    const nestedBlock = this.fragment?.braceBlock?.()?.block?.();
    return this.blockHeight(nestedBlock, fragmentOrigin);
  }

  protected traverseNested(
    origin: string,
    startTop: number,
    visitor: (statement: StatementVM, top: number) => void,
  ): void {
    const fragmentOrigin = this.resolveFragmentOrigin(origin);
    const currentTop = startTop + FRAGMENT_HEADER_HEIGHT + FRAGMENT_MARGIN;
    const nestedBlock = this.fragment?.braceBlock?.()?.block?.();
    if (nestedBlock) {
      const blockVM = new BlockVM(nestedBlock, this.runtime);
      blockVM.traverse(fragmentOrigin, currentTop, visitor);
    }
  }
}
