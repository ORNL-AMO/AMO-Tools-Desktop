import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Observable, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getNewIdString } from '../../../../shared/helperFunctions';
import { WallLossesSurfaceDbService } from '../../../../indexedDb/wall-losses-surface-db.service';
import { WallLoss } from '../../../models/wall-loss';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { LossItemsStore } from '../loss-items-store';
import { WallLossCalculationService } from './wall-loss-calculation.service';
import { WallLossForm, WallLossesFormService } from './wall-losses-form.service';

export interface WallLossItem {
  id: string;
  name: string;
  form: WallLossForm;
  collapse: boolean;
  heatLoss: number | null;
}

@Injectable()
export class WallLossesService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly wallLossCalculationService = inject(WallLossCalculationService);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly formService = inject(WallLossesFormService);
  private readonly wallSurfaceDbService = inject(WallLossesSurfaceDbService);

  private scenario: AssessmentScenario = 'baseline';
  private readonly store = new LossItemsStore<WallLossItem>();

  readonly losses = this.store.all;
  readonly surfaceOptions = signal<WallLossesSurface[]>([]);
  readonly total = computed(() =>
    this.losses().reduce((sum, item) => sum + (item.heatLoss ?? 0), 0)
  );

  initialize(wallLosses: WallLoss[], scenario: AssessmentScenario = 'baseline'): void {
    this.scenario = scenario;
    const items = wallLosses.map((loss, idx) => this.buildItem(this.ensureId(loss), idx + 1));
    this.store.load(items);
    this.wallSurfaceDbService.getAllWithObservable()
      .pipe(take(1))
      .subscribe(surfaces => this.surfaceOptions.set(surfaces));
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
    const item = this.buildItem({ id }, this.store.all().length + 1);
    this.store.add(item);
    this.saveLosses();
  }

  remove(id: string): void {
    this.store.remove(id);
    this.saveLosses();
  }

  private ensureId(loss: WallLoss): WallLoss & { id: string } {
    return loss.id ? (loss as WallLoss & { id: string }) : { ...loss, id: getNewIdString() };
  }

  private buildItem(loss: WallLoss & { id: string }, fallbackIdx: number): WallLossItem {
    const item: WallLossItem = {
      id: loss.id,
      name: loss.name ?? `Loss #${fallbackIdx}`,
      form: this.formService.getWallLossForm(loss),
      collapse: false,
      heatLoss: loss.heatLoss ?? null,
    };
    this.calculateItemResult(item);
    this.observeItem(item);
    return item;
  }

  private observeItem(item: WallLossItem): void {
    const valueChanges: Observable<unknown> = item.form.valueChanges;
    valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateItem(item.id);
    });
  }

  private calculateItemResult(item: WallLossItem): void {
    if (item.form.valid) {
      const wallLoss = this.formService.buildWallLoss(item.form);
      const settings = this.assessmentService.settingsSignal();
      item.heatLoss = this.wallLossCalculationService.calculate(wallLoss, settings);
    } else {
      item.heatLoss = null;
    }
  }

  private saveLosses(): void {
    const wallLosses: WallLoss[] = this.store.all().map(item => {
      const loss = this.formService.buildWallLoss(item.form);
      loss.id = item.id;
      loss.name = item.name;
      loss.heatLoss = item.heatLoss ?? undefined;
      return loss;
    });

    if (this.scenario === 'baseline') {
      const current = this.assessmentService.processHeatingSignal();
      this.assessmentService.updateProcessHeatingProperty('losses', { ...current?.losses, wallLosses });
    } else {
      const modification = this.assessmentService.getModifications(this.assessmentService.processHeatingSignal())
        .find(mod => mod.id === this.scenario);
      this.assessmentService.updateModificationProperty(this.scenario, 'losses', {
        ...modification?.scenarioOverrides?.losses,
        wallLosses,
      });
    }
  }
}
