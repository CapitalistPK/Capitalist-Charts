/** Watches an element's size so charts are drawn at real pixel sizes. */
export class SizeWatcher {
  w = 0;
  h = 0;
  private ro: ResizeObserver | null = null;
  constructor(private readonly onChange: () => void) {}
  observe(el: Element | null): void {
    if (!el || this.ro || typeof ResizeObserver !== 'function') return;
    this.ro = new ResizeObserver(([entry]) => {
      const r = entry!.contentRect;
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (w !== this.w || h !== this.h) {
        this.w = w;
        this.h = h;
        this.onChange();
      }
    });
    this.ro.observe(el);
  }
  disconnect(): void {
    this.ro?.disconnect();
    this.ro = null;
  }
}
