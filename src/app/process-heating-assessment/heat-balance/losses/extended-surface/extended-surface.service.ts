import { computed, DestroyRef, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getNewIdString } from '../../../../shared/helperFunctions';
import { ExtendedSurface } from '../../../models/extended-surface';
import { WallLoss } from '../../../models/wall-loss';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { LossItemsStore } from '../loss-items-store';
import { WallLossCalculationService } from '../wall-losses/wall-loss-calculation.service';
import { ExtendedSurfaceForm, ExtendedSurfaceFormService } from './extended-surface-form.service';

export interface ExtendedSurfaceItem {
  id: string;
  name: string;
  form: ExtendedSurfaceForm;
  collapse: boolean;
  heatLoss: number | null;
}

@Injectable()
export class ExtendedSurfaceService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly wallLossCalculationService = inject(WallLossCalculationService);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly formService = inject(ExtendedSurfaceFormService);

  private scenario: AssessmentScenario = 'baseline';
  private readonly store = new LossItemsStore<ExtendedSurfaceItem>();

  readonly surfaces = this.store.all;
  readonly total = computed(() =>
    this.surfaces().reduce((sum, item) => sum + (item.heatLoss ?? 0), 0)
  );

  initialize(extendedSurfaces: ExtendedSurface[], scenario: AssessmentScenario = 'baseline'): void {
    this.scenario = scenario;
    const items = extendedSurfaces.map((surface, idx) => this.buildItem(this.ensureId(surface), idx + 1));
    this.store.load(items);
  }

  updateItem(id: string): void {
    const item = this.store.get(id);
    if (!item) return;
    const updated = { ...item };
    this.calculateItemResult(updated);
    this.store.set(id, updated);
    this.saveSurfaces();
  }

  setName(id: string, name: string): void {
    this.store.update(id, { name });
    this.saveSurfaces();
  }

  toggleCollapse(id: string): void {
    const item = this.store.get(id);
    if (item) this.store.update(id, { collapse: !item.collapse });
  }

  add(): void {
    const id = getNewIdString();
    const item = this.buildItem({ id }, this.store.all().length + 1);
    this.store.add(item);
    this.saveSurfaces();
  }

  remove(id: string): void {
    this.store.remove(id);
    this.saveSurfaces();
  }

  private ensureId(surface: ExtendedSurface): ExtendedSurface & { id: string } {
    return surface.id ? (surface as ExtendedSurface & { id: string }) : { ...surface, id: getNewIdString() };
  }

  private buildItem(surface: ExtendedSurface & { id: string }, fallbackIdx: number): ExtendedSurfaceItem {
    const item: ExtendedSurfaceItem = {
      id: surface.id,
      name: surface.name ?? `Loss #${fallbackIdx}`,
      form: this.formService.getExtendedSurfaceForm(surface),
      collapse: false,
      heatLoss: surface.heatLoss ?? null,
    };
    this.calculateItemResult(item);
    this.observeItem(item);
    return item;
  }

  private observeItem(item: ExtendedSurfaceItem): void {
    const valueChanges: Observable<unknown> = item.form.valueChanges;
    valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.updateItem(item.id);
    });
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
      const result = this.wallLossCalculationService.calculate(asWallLoss, settings);
      item.heatLoss = isNaN(result) ? null : result;
    } else {
      item.heatLoss = null;
    }
  }

  private saveSurfaces(): void {
    const extendedSurfaces: ExtendedSurface[] = this.store.all().map(item => {
      const surface = this.formService.buildExtendedSurface(item.form);
      surface.id = item.id;
      surface.name = item.name;
      surface.heatLoss = item.heatLoss ?? undefined;
      return surface;
    });

    if (this.scenario === 'baseline') {
      const current = this.assessmentService.processHeatingSignal();
      this.assessmentService.updateProcessHeatingProperty('losses', { ...current?.losses, extendedSurfaces });
    } else {
      const modification = this.assessmentService.getModifications(this.assessmentService.processHeatingSignal())
        .find(mod => mod.id === this.scenario);
      this.assessmentService.updateModificationProperty(this.scenario, 'losses', {
        ...modification?.scenarioOverrides?.losses,
        extendedSurfaces,
      });
    }
  }
}
