import { STATEMENT_CONTAINER_MARGIN } from "@/positioning/Constants";
import { NodeVM } from "./NodeVM";
import type { BlockLayout, LayoutRuntime } from "./types";
import { createStatementVM } from "./createStatementVM";
import { StatementVM } from "./StatementVM";

export class BlockVM extends NodeVM {
  private readonly statements: any[];

  constructor(context: any, runtime: LayoutRuntime) {
    super(context, runtime);
    this.statements = context?.stat?.() || [];
  }

  public layout(origin: string, startTop: number): BlockLayout {
    const tops: number[] = [];
    const statements: any[] = [];
    let currentTop = startTop;

    this.statements.forEach((statement: any) => {
      const statementTop = currentTop;
      const statementVM = createStatementVM(statement, this.runtime);
      const statementHeight = statementVM.height(origin);
      currentTop += statementHeight;
      tops.push(statementTop);
      statements.push(statementVM);
    });
    currentTop += STATEMENT_CONTAINER_MARGIN;
    return { tops, endTop: currentTop, statements };
  }

  public advance(origin: string, startTop: number): number {
    return this.layout(origin, startTop).endTop;
  }

  public height(origin: string): number {
    return this.layout(origin, 0).endTop;
  }

  public traverse(
    origin: string,
    startTop: number,
    visitor: (statement: StatementVM, top: number) => void,
  ): void {
    let currentTop = startTop;
    this.statements.forEach((statement: any) => {
      const statementVM = createStatementVM(statement, this.runtime);
      statementVM.traverse(origin, currentTop, visitor);
      currentTop += statementVM.height(origin);
    });
  }
}
