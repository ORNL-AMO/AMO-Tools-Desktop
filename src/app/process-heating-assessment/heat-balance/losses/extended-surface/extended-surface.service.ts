import { computed, inject, Injectable, signal } from '@angular/core';
import { ExtendedSurface } from '../../../../shared/models/phast/losses/extendedSurface';
import { WallLoss } from '../../../../shared/models/phast/losses/wallLoss';
import { PhastService } from '../../../../phast/phast.service';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ExtendedSurfaceForm, ExtendedSurfaceFormService } from './extended-surface-form.service';

export interface ExtendedSurfaceItem {
  name: string;
  form: ExtendedSurfaceForm;
  collapse: boolean;
  heatLoss: number | null;
}

@Injectable()
export class ExtendedSurfaceService {
  private readonly phastService = inject(PhastService);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly formService = inject(ExtendedSurfaceFormService);

  readonly surfaces = signal<ExtendedSurfaceItem[]>([]);
  readonly total = computed(() =>
    this.surfaces().reduce((sum, item) => sum + (item.heatLoss ?? 0), 0)
  );

  initialize(extendedSurfaces: ExtendedSurface[]): void {
    const items = extendedSurfaces.map((surface, idx) => this.buildItem(surface, idx + 1));
    items.forEach(item => this.calculateItemResult(item));
    this.surfaces.set(items);
  }

  updateItem(idx: number): void {
    const items = this.surfaces();
    const item = { ...items[idx] };
    this.calculateItemResult(item);
    const updated = items.map((surface, i) => i === idx ? item : surface);
    this.surfaces.set(updated);
    this.saveSurfaces(updated);
  }

  setName(idx: number, name: string): void {
    const updated = this.surfaces().map((surface, i) => i === idx ? { ...surface, name } : surface);
    this.surfaces.set(updated);
    this.saveSurfaces(updated);
  }

  toggleCollapse(idx: number): void {
    const updated = this.surfaces().map((surface, i) => i === idx ? { ...surface, collapse: !surface.collapse } : surface);
    this.surfaces.set(updated);
  }

  add(): void {
    const idx = this.surfaces().length;
    const newItem: ExtendedSurfaceItem = {
      name: `Loss #${idx + 1}`,
      form: this.formService.initExtendedSurfaceForm(),
      collapse: false,
      heatLoss: null,
    };
    const updated = [...this.surfaces(), newItem];
    this.surfaces.set(updated);
    this.saveSurfaces(updated);
  }

  remove(idx: number): void {
    const updated = this.surfaces().filter((_, i) => i !== idx);
    this.surfaces.set(updated);
    this.saveSurfaces(updated);
  }

  private buildItem(surface: ExtendedSurface, lossIdx: number): ExtendedSurfaceItem {
    return {
      name: surface.name ?? `Loss #${lossIdx}`,
      form: this.formService.getExtendedSurfaceForm(surface),
      collapse: false,
      heatLoss: surface.heatLoss ?? null,
    };
  }

  private calculateItemResult(item: ExtendedSurfaceItem): void {
    if (item.form.valid) {
      const extSurface = this.formService.buildExtendedSurface(item.form);
      // Extended surface reuses the wall-loss WASM with hardcoded aerodynamic assumptions
      const asWallLoss: WallLoss = {
        surfaceArea: extSurface.surfaceArea,
        ambientTemperature: extSurface.ambientTemperature,
        surfaceTemperature: extSurface.surfaceTemperature,
        surfaceEmissivity: extSurface.surfaceEmissivity,
        windVelocity: 5,
        correctionFactor: 1,
        conditionFactor: 1,
      };
      const settings = this.assessmentService.settingsSignal();
      const result = this.phastService.wallLosses(asWallLoss, settings);
      item.heatLoss = isNaN(result) ? null : result;
    } else {
      item.heatLoss = null;
    }
  }

  private saveSurfaces(items: ExtendedSurfaceItem[]): void {
    const extendedSurfaces: ExtendedSurface[] = items.map(item => {
      const surface = this.formService.buildExtendedSurface(item.form);
      surface.name = item.name;
      surface.heatLoss = item.heatLoss ?? undefined;
      return surface;
    });
    const current = this.assessmentService.processHeatingSignal();
    this.assessmentService.updateProcessHeatingProperty('losses', { ...current.losses, extendedSurfaces });
  }
}
