import { computed, inject, Injectable, signal } from '@angular/core';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { PhastService } from '../../../../phast/phast.service';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { WallLossForm, WallLossesFormService } from './wall-losses-form.service';

export interface WallLossItem {
  name: string;
  form: WallLossForm;
  collapse: boolean;
  heatLoss: number | null;
}

@Injectable()
export class WallLossesService {
  private readonly phastService = inject(PhastService);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly formService = inject(WallLossesFormService);

  readonly losses = signal<WallLossItem[]>([]);
  readonly surfaceOptions = signal<WallLossesSurface[]>([]);
  readonly total = computed(() =>
    this.losses().reduce((sum, item) => sum + (item.heatLoss ?? 0), 0)
  );

  initialize(wallLosses: WallLoss[]): void {
    const items = wallLosses.map((loss, idx) => this.buildItem(loss, idx + 1));
    items.forEach(item => this.calculateItemResult(item));
    this.losses.set(items);
  }

  updateItem(idx: number): void {
    const items = this.losses();
    const item = { ...items[idx] };
    this.calculateItemResult(item);
    const updated = items.map((loss, i) => i === idx ? item : loss);
    this.losses.set(updated);
    this.saveLosses(updated);
  }

  setName(idx: number, name: string): void {
    const updated = this.losses().map((loss, i) => i === idx ? { ...loss, name } : loss);
    this.losses.set(updated);
    this.saveLosses(updated);
  }

  toggleCollapse(idx: number): void {
    const updated = this.losses().map((loss, i) => i === idx ? { ...loss, collapse: !loss.collapse } : loss);
    this.losses.set(updated);
  }

  add(): void {
    const idx = this.losses().length;
    const newItem: WallLossItem = {
      name: `Loss #${idx + 1}`,
      form: this.formService.initWallLossForm(idx + 1),
      collapse: false,
      heatLoss: null,
    };
    const updated = [...this.losses(), newItem];
    this.losses.set(updated);
    this.saveLosses(updated);
  }

  remove(idx: number): void {
    const updated = this.losses().filter((_, i) => i !== idx);
    this.losses.set(updated);
    this.saveLosses(updated);
  }

  private buildItem(loss: WallLoss, lossIdx: number): WallLossItem {
    return {
      name: loss.name ?? `Loss #${lossIdx}`,
      form: this.formService.getWallLossForm(loss),
      collapse: false,
      heatLoss: loss.heatLoss ?? null,
    };
  }

  private calculateItemResult(item: WallLossItem): void {
    if (item.form.valid) {
      const wallLoss = this.formService.buildWallLoss(item.form);
      const settings = this.assessmentService.settingsSignal();
      item.heatLoss = this.phastService.wallLosses(wallLoss, settings);
    } else {
      item.heatLoss = null;
    }
  }

  private saveLosses(items: WallLossItem[]): void {
    const wallLosses: WallLoss[] = items.map(item => {
      const loss = this.formService.buildWallLoss(item.form);
      loss.name = item.name;
      loss.heatLoss = item.heatLoss ?? undefined;
      return loss;
    });
    const current = this.assessmentService.processHeatingSignal();
    this.assessmentService.updateProcessHeatingProperty('losses', { ...current.losses, wallLosses });
  }
}
