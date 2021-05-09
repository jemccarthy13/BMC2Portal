export class PaintBrush {
  private static ctx: CanvasRenderingContext2D

  constructor(ctx: CanvasRenderingContext2D) {
    PaintBrush.ctx = ctx
  }

  public static use(ctx: CanvasRenderingContext2D | undefined | null): void {
    if (ctx) PaintBrush.ctx = ctx
  }

  public static getContext(): CanvasRenderingContext2D {
    return PaintBrush.ctx
  }
}
