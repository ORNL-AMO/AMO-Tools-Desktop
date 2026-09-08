import { computed, signal } from '@angular/core';

export interface EntityWithId {
  id: string;
}

/**
 * Signal-based, id-keyed list store for a loss type's entries (charge materials, wall losses,
 * extended surfaces, ...). Keeps insertion order separate from the keyed map so items can be
 * patched/replaced by id without disturbing list order or forcing a full-array rebuild + form
 * teardown on every edit.
 */
export class LossItemsStore<T extends EntityWithId> {
  private readonly order = signal<string[]>([]);
  private readonly entities = signal<ReadonlyMap<string, T>>(new Map());

  readonly all = computed(() => {
    const entities = this.entities();
    return this.order().map(id => entities.get(id)).filter((entity): entity is T => entity !== undefined);
  });

  load(items: T[]): void {
    this.order.set(items.map(item => item.id));
    this.entities.set(new Map(items.map(item => [item.id, item])));
  }

  get(id: string): T | undefined {
    return this.entities().get(id);
  }

  add(item: T): void {
    this.order.set([...this.order(), item.id]);
    this.entities.set(new Map(this.entities()).set(item.id, item));
  }

  remove(id: string): void {
    this.order.set(this.order().filter(existing => existing !== id));
    const next = new Map(this.entities());
    next.delete(id);
    this.entities.set(next);
  }

  set(id: string, item: T): void {
    this.entities.set(new Map(this.entities()).set(id, item));
  }

  update(id: string, patch: Partial<T>): void {
    const current = this.get(id);
    if (current) this.set(id, { ...current, ...patch });
  }
}
