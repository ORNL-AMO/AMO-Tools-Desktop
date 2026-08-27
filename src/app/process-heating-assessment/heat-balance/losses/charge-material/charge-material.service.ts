import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { getNewIdString } from '../../../../shared/helperFunctions';
import { ChargeMaterial, ChargeMaterialResult, ChargeMaterialType } from '../../../../shared/models/phast/losses/chargeMaterial';
import { AssessmentScenario, ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ChargeMaterialResultsService } from './charge-material-results.service';
import { EntityListStore } from '../entity-list-store';
import { GasMaterialForm, GasMaterialFormService } from './gas-form/gas-material-form.service';
import { LiquidMaterialForm, LiquidMaterialFormService } from './liquid-form/liquid-material-form.service';
import { SolidMaterialForm, SolidMaterialFormService } from './solid-form/solid-material-form.service';

interface ChargeMaterialItemBase {
  id: string;
  name: string;
}

export interface SolidChargeMaterialItem extends ChargeMaterialItemBase {
  type: typeof ChargeMaterialType.Solid;
  form: SolidMaterialForm;
}

export interface LiquidChargeMaterialItem extends ChargeMaterialItemBase {
  type: typeof ChargeMaterialType.Liquid;
  form: LiquidMaterialForm;
}

export interface GasChargeMaterialItem extends ChargeMaterialItemBase {
  type: typeof ChargeMaterialType.Gas;
  form: GasMaterialForm;
}

export type ChargeMaterialItem = SolidChargeMaterialItem | LiquidChargeMaterialItem | GasChargeMaterialItem;

export interface ChargeMaterialTotals {
  heatRequired: number;
  netHeatLoss: number;
  endoExoHeat: number;
}

const EMPTY_TOTALS: ChargeMaterialTotals = { heatRequired: 0, netHeatLoss: 0, endoExoHeat: 0 };

@Injectable()
export class ChargeMaterialService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly chargeMaterialResultsService = inject(ChargeMaterialResultsService);
  private readonly solidFormService = inject(SolidMaterialFormService);
  private readonly liquidFormService = inject(LiquidMaterialFormService);
  private readonly gasFormService = inject(GasMaterialFormService);

  private scenario: AssessmentScenario = 'baseline';
  private readonly store = new EntityListStore<ChargeMaterialItem>();

  // Caches a switched-away-from type's last known values per entry so switching back restores
  // them
  private readonly typeCache = new Map<string, Partial<Record<ChargeMaterialType, ChargeMaterial>>>();

  readonly materials = this.store.all;
  readonly collapsedIds = signal<ReadonlySet<string>>(new Set());

  readonly isMaterialAdditionLocked = computed(() => (this.assessmentService.processHeatingSignal()?.modifications?.length ?? 0) > 0);

  readonly results = computed(() => {
    const items = this.materials();
    const settings = this.assessmentService.settingsSignal();
    const chargeMaterialResults = this.chargeMaterialResultsService.getResults(
      items.map(item => ({ material: this.buildChargeMaterial(item), valid: item.form.valid })),
      settings,
    );
    const resultsMap = new Map<string, ChargeMaterialResult | undefined>();
    items.forEach((item, index) => resultsMap.set(item.id, chargeMaterialResults[index]));
    return resultsMap;
  });

  readonly materialResultTotals = computed<ChargeMaterialTotals>(() => {
    const results = this.results();
    let totals: ChargeMaterialTotals = { ...EMPTY_TOTALS };
    for (const result of results.values()) {
      if (result) {
        totals = {
          heatRequired: totals.heatRequired + (result.heatRequired ?? 0),
          netHeatLoss: totals.netHeatLoss + (result.netHeatLoss ?? 0),
          endoExoHeat: totals.endoExoHeat + (result.endoExoHeat ?? 0),
        };
      }
    }
    return totals;
  });

  initialize(scenario: AssessmentScenario = 'baseline'): void {
    this.scenario = scenario;
    this.typeCache.clear();

    const chargeMaterials = this.assessmentService.scenarioPhast(scenario)?.losses?.chargeMaterials ?? [];
    const items = chargeMaterials.map((material, index) => this.buildItem(this.ensureId(material), index));
    this.store.load(items);
  }

  toggleCollapse(id: string): void {
    const next = new Set(this.collapsedIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.collapsedIds.set(next);
  }

  add(): void {
    if (this.isMaterialAdditionLocked()) return;
    const id = getNewIdString();
    const name = `Material #${this.store.all().length + 1}`;
    const item = this.createItem({ chargeMaterialType: ChargeMaterialType.Solid, name }, id, this.store.all().length);
    this.observeItem(item);
    this.store.add(item);
    this.saveLosses();
  }

  remove(id: string): void {
    if (this.isMaterialAdditionLocked()) return;
    this.typeCache.delete(id);
    this.store.remove(id);
    this.saveLosses();
  }

  setName(id: string, name: string): void {
    this.store.update(id, { name });
    this.saveLosses();
  }

  switchType(id: string, type: ChargeMaterialType): void {
    const current = this.store.get(id);
    if (!current || current.type === type) return;

    const cacheForItem: Partial<Record<ChargeMaterialType, ChargeMaterial>> = this.typeCache.get(id) ?? {};
    cacheForItem[current.type] = this.buildChargeMaterial(current);
    this.typeCache.set(id, cacheForItem);

    const seedMaterial = cacheForItem[type] ?? { chargeMaterialType: type };
    const nextItem = this.createItem({ ...seedMaterial, chargeMaterialType: type, name: current.name }, id, 0);
    this.observeItem(nextItem);
    this.store.set(id, nextItem);
    this.saveLosses();
  }

  private ensureId(material: ChargeMaterial): ChargeMaterial & { id: string } {
    return material.id ? (material as ChargeMaterial & { id: string }) : { ...material, id: getNewIdString() };
  }

  private buildItem(chargeMaterial: ChargeMaterial & { id: string }, fallbackIndex: number): ChargeMaterialItem {
    const item = this.createItem(chargeMaterial, chargeMaterial.id, fallbackIndex);
    this.observeItem(item);
    return item;
  }

  private createItem(chargeMaterial: ChargeMaterial, id: string, fallbackIndex: number): ChargeMaterialItem {
    const name = chargeMaterial.name ?? `Material #${fallbackIndex + 1}`;
    switch (chargeMaterial.chargeMaterialType) {
      case ChargeMaterialType.Liquid:
        return { id, name, type: ChargeMaterialType.Liquid, form: this.liquidFormService.getLiquidChargeMaterialForm(chargeMaterial) };
      case ChargeMaterialType.Gas:
        return { id, name, type: ChargeMaterialType.Gas, form: this.gasFormService.getGasChargeMaterialForm(chargeMaterial) };
      case ChargeMaterialType.Solid:
      default:
        return { id, name, type: ChargeMaterialType.Solid, form: this.solidFormService.getSolidChargeMaterialForm(chargeMaterial) };
    }
  }

  private observeItem(item: ChargeMaterialItem): void {
    const valueChanges: Observable<unknown> = item.form.valueChanges;
    valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.saveLosses();
    });
  }

  private buildChargeMaterial(item: ChargeMaterialItem): ChargeMaterial {
    switch (item.type) {
      case ChargeMaterialType.Solid: return this.solidFormService.buildSolidChargeMaterial(item.form);
      case ChargeMaterialType.Liquid: return this.liquidFormService.buildLiquidChargeMaterial(item.form);
      case ChargeMaterialType.Gas: return this.gasFormService.buildGasChargeMaterial(item.form);
    }
  }

  private saveLosses(): void {
    const chargeMaterials = this.store.all().map(item => ({ ...this.buildChargeMaterial(item), name: item.name, id: item.id }));

    if (this.scenario === 'baseline') {
      const current = this.assessmentService.processHeatingSignal();
      this.assessmentService.updateProcessHeatingProperty('losses', { ...current?.losses, chargeMaterials });
    } else {
      const modification = this.assessmentService.getModifications(this.assessmentService.processHeatingSignal()).find(mod => mod.id === this.scenario);
      const existingOverrideLosses = modification?.scenarioOverrides?.losses;
      this.assessmentService.updateModificationProperty(this.scenario, 'losses', {
        ...existingOverrideLosses,
        chargeMaterials,
      });
    }
  }
}
