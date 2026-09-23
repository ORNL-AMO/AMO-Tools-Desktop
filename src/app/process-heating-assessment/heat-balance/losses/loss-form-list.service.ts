import { computed, DestroyRef, inject, Signal } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { getNewIdString } from '../../../shared/helperFunctions';
import { Settings } from '../../../shared/models/settings';
import { Losses } from '../../models/phast';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';
import { EntityWithId, LossItemsStore } from './loss-items-store';

export interface LossFormItem<TForm> extends EntityWithId {
  name: string;
  form: TForm;
  collapse: boolean;
  heatLoss: number | null;
}

export interface LossEntity {
  id?: string;
  name?: string;
  heatLoss?: number;
}

/**
 * Shared multi-entry loss list behavior: load, build a per-entry form, recalculate and autosave on
 * `valueChanges`, add/remove/rename. Parameterized by the loss key and three hooks for what's
 * type-specific (form build, loss build, calculation). Materially different shapes (e.g.
 * `ChargeMaterialService`'s solid/liquid/gas sub-forms) stay their own service instead.
 */
export abstract class LossFormListService<TLoss extends LossEntity, TForm extends FormGroup<any>> {
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly assessmentService = inject(ProcessHeatingAssessmentService);

  protected scenario: AssessmentScenario = 'baseline';
  private readonly store = new LossItemsStore<LossFormItem<TForm>>();
  private readonly subscriptions = new Map<string, Subscription>();

  readonly items: Signal<LossFormItem<TForm>[]> = this.store.all;
  readonly total: Signal<number> = computed(() =>
    this.items().reduce((sum, item) => sum + (item.heatLoss ?? 0), 0)
  );

  protected abstract readonly lossKey: keyof Losses;
  protected abstract buildForm(loss: TLoss): TForm;
  protected abstract buildLoss(form: TForm): TLoss;
  protected abstract calculateResult(form: TForm, settings: Settings): number | null;

  initialize(scenario: AssessmentScenario = 'baseline'): void {
    this.scenario = scenario;
    const losses = (this.assessmentService.lossSignal(scenario, this.lossKey) as TLoss[] | undefined) ?? [];
    const items = losses.map((loss, idx) => this.buildItem(this.ensureId(loss), idx + 1));
    this.store.load(items);
  }

  updateItem(id: string): void {
    const item = this.store.get(id);
    if (!item) return;
    const updated = { ...item };
    this.calculateItemResult(updated);
    this.store.set(id, updated);
    this.saveLosses();
  }

  setName(id: string, name: string): void {
    this.store.update(id, { name });
    this.saveLosses();
  }

  toggleCollapse(id: string): void {
    const item = this.store.get(id);
    if (item) this.store.update(id, { collapse: !item.collapse });
  }

  add(): void {
    const id = getNewIdString();
    const item = this.buildItem({ id } as TLoss & EntityWithId, this.store.all().length + 1);
    this.store.add(item);
    this.saveLosses();
  }

  remove(id: string): void {
    this.subscriptions.get(id)?.unsubscribe();
    this.subscriptions.delete(id);
    this.store.remove(id);
    this.saveLosses();
  }

  /** Swaps an entry's form for one of a different shape (e.g. a cooling loss switching gas ↔ liquid). */
  protected replaceForm(id: string, form: TForm): void {
    const item = this.store.get(id);
    if (!item) return;
    const updated = { ...item, form };
    this.calculateItemResult(updated);
    this.store.set(id, updated);
    this.observeItem(updated);
    this.saveLosses();
  }

  private ensureId(loss: TLoss): TLoss & EntityWithId {
    return loss.id ? (loss as TLoss & EntityWithId) : { ...loss, id: getNewIdString() };
  }

  private buildItem(loss: TLoss & EntityWithId, fallbackIdx: number): LossFormItem<TForm> {
    const item: LossFormItem<TForm> = {
      id: loss.id,
      name: loss.name ?? `Loss #${fallbackIdx}`,
      form: this.buildForm(loss),
      collapse: false,
      heatLoss: loss.heatLoss ?? null,
    };
    this.calculateItemResult(item);
    this.observeItem(item);
    return item;
  }

  private observeItem(item: LossFormItem<TForm>): void {
    this.subscriptions.get(item.id)?.unsubscribe();
    const valueChanges: Observable<unknown> = item.form.valueChanges;
    const subscription = valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateItem(item.id);
    });
    this.subscriptions.set(item.id, subscription);
  }

  private calculateItemResult(item: LossFormItem<TForm>): void {
    if (item.form.valid) {
      const settings = this.assessmentService.settingsSignal();
      item.heatLoss = this.calculateResult(item.form, settings);
    } else {
      item.heatLoss = null;
    }
  }

  private saveLosses(): void {
    const losses = this.store.all().map(item => ({
      ...this.buildLoss(item.form),
      id: item.id,
      name: item.name,
      heatLoss: item.heatLoss ?? undefined,
    }));

    /** `TLoss[]` matches `Losses[typeof this.lossKey]` per subclass, but TS can't verify that generically here. */
    this.assessmentService.updateLossesProperty(this.scenario, this.lossKey, losses as never);
  }
}
