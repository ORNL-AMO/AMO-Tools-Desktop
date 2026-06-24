import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { ChargeMaterial, ChargeMaterialType } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from '../../../../phast/phast.service';
import { SolidMaterialFormService, SolidMaterialForm } from './solid-form/solid-material-form.service';
import { LiquidMaterialFormService, LiquidMaterialForm } from './liquid-form/liquid-material-form.service';
import { GasMaterialFormService, GasMaterialForm } from './gas-form/gas-material-form.service';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';

export interface ChargeMaterialItem {
  name: string;
  type: ChargeMaterialType;
  form: SolidMaterialForm | LiquidMaterialForm | GasMaterialForm;
  collapse: boolean;
  heatRequired: number | null;
  netHeatLoss: number | null;
  endoExoHeat: number | null;
}

@Injectable()
export class ChargeMaterialService {
  private readonly phastService = inject(PhastService);
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  private readonly solidFormService = inject(SolidMaterialFormService);
  private readonly liquidFormService = inject(LiquidMaterialFormService);
  private readonly gasFormService = inject(GasMaterialFormService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  readonly materials = signal<ChargeMaterialItem[]>([]);
  readonly totals = computed(() => ({
    heatRequired: this.materials().reduce((sum, material) => sum + (material.heatRequired ?? 0), 0),
    netHeatLoss: this.materials().reduce((sum, material) => sum + (material.netHeatLoss ?? 0), 0),
    endoExoHeat: this.materials().reduce((sum, material) => sum + (material.endoExoHeat ?? 0), 0),
  }));

  initialize(chargeMaterials: ChargeMaterial[]): void {
    const items = chargeMaterials.map((mat, idx) => this.buildItem(mat, idx + 1));
    items.forEach(item => this.calculateItemResults(item));
    this.materials.set(items);
  }

  updateItem(idx: number): void {
    const items = this.materials();
    const item = { ...items[idx] };
    this.calculateItemResults(item);
    const updated = items.map((m, i) => i === idx ? item : m);
    this.materials.set(updated);
    this.saveLosses(updated);
  }

  setName(idx: number, name: string): void {
    const updated = this.materials().map((m, i) => i === idx ? { ...m, name } : m);
    this.materials.set(updated);
    this.saveLosses(updated);
  }

  toggleCollapse(idx: number): void {
    const updated = this.materials().map((m, i) => i === idx ? { ...m, collapse: !m.collapse } : m);
    this.materials.set(updated);
  }

  add(): void {
    const idx = this.materials().length;
    const newItem: ChargeMaterialItem = {
      name: `Material #${idx + 1}`,
      type: ChargeMaterialType.Solid,
      form: this.solidFormService.initSolidForm(idx + 1),
      collapse: false,
      heatRequired: 0,
      netHeatLoss: 0,
      endoExoHeat: 0,
    };
    const updated = [...this.materials(), newItem];
    this.materials.set(updated);
    this.saveLosses(updated);
  }

  remove(idx: number): void {
    const updated = this.materials().filter((_, i) => i !== idx);
    this.materials.set(updated);
    this.saveLosses(updated);
  }

  switchType(idx: number, type: ChargeMaterialType): void {
    const items = this.materials();
    const current = items[idx];
    const lossNumber = idx + 1;
    let form: SolidMaterialForm | LiquidMaterialForm | GasMaterialForm;

    if (type === ChargeMaterialType.Solid) {
      form = this.solidFormService.initSolidForm(lossNumber);
    } else if (type === ChargeMaterialType.Liquid) {
      form = this.liquidFormService.initLiquidForm(lossNumber);
    } else {
      form = this.gasFormService.initGasForm(lossNumber);
    }

    const updated = items.map((m, i) =>
      i === idx ? { ...current, type, form, heatRequired: 0, netHeatLoss: 0, endoExoHeat: 0 } : m
    );
    this.materials.set(updated);
    this.saveLosses(updated);
  }

  private buildItem(material: ChargeMaterial, lossIdx: number): ChargeMaterialItem {
    const name = material.name ?? `Material #${lossIdx}`;
    if (material.chargeMaterialType === ChargeMaterialType.Gas) {
      return {
        name,
        type: ChargeMaterialType.Gas,
        form: this.gasFormService.getGasChargeMaterialForm(material),
        collapse: false,
        heatRequired: material.gasChargeMaterial?.heatRequired ?? 0,
        netHeatLoss: material.gasChargeMaterial?.netHeatLoss ?? 0,
        endoExoHeat: material.gasChargeMaterial?.endoExoHeat ?? 0,
      };
    }
    if (material.chargeMaterialType === ChargeMaterialType.Liquid) {
      return {
        name,
        type: ChargeMaterialType.Liquid,
        form: this.liquidFormService.getLiquidChargeMaterialForm(material),
        collapse: false,
        heatRequired: material.liquidChargeMaterial?.heatRequired ?? 0,
        netHeatLoss: material.liquidChargeMaterial?.netHeatLoss ?? 0,
        endoExoHeat: material.liquidChargeMaterial?.endoExoHeat ?? 0,
      };
    }
    return {
      name,
      type: ChargeMaterialType.Solid,
      form: this.solidFormService.getSolidChargeMaterialForm(material),
      collapse: false,
      heatRequired: material.solidChargeMaterial?.heatRequired ?? 0,
      netHeatLoss: material.solidChargeMaterial?.netHeatLoss ?? 0,
      endoExoHeat: material.solidChargeMaterial?.endoExoHeat ?? 0,
    };
  }

  private calculateItemResults(item: ChargeMaterialItem): void {
    const settings = this.settings();
    if (item.type === ChargeMaterialType.Solid && item.form.valid) {
      const chargeMaterial = this.solidFormService.buildSolidChargeMaterial(item.form as SolidMaterialForm);
      const result = this.phastService.solidLoadChargeMaterial(chargeMaterial.solidChargeMaterial!, settings);
      item.heatRequired = result.grossHeatLoss;
      item.netHeatLoss = result.netHeatLoss;
      item.endoExoHeat = result.endoExoHeat;
    } else if (item.type === ChargeMaterialType.Liquid && item.form.valid) {
      const chargeMaterial = this.liquidFormService.buildLiquidChargeMaterial(item.form as LiquidMaterialForm);
      const result = this.phastService.liquidLoadChargeMaterial(chargeMaterial.liquidChargeMaterial!, settings);
      item.heatRequired = result.grossHeatLoss;
      item.netHeatLoss = result.netHeatLoss;
      item.endoExoHeat = result.endoExoHeat;
    } else if (item.type === ChargeMaterialType.Gas && item.form.valid) {
      const chargeMaterial = this.gasFormService.buildGasChargeMaterial(item.form as GasMaterialForm);
      const result = this.phastService.gasLoadChargeMaterial(chargeMaterial.gasChargeMaterial!, settings);
      item.heatRequired = result.grossHeatLoss;
      item.netHeatLoss = result.netHeatLoss;
      item.endoExoHeat = result.endoExoHeat;
    } else {
      item.heatRequired = null;
      item.netHeatLoss = null;
      item.endoExoHeat = null;
    }
  }

  private saveLosses(items: ChargeMaterialItem[]): void {
    const chargeMaterials: ChargeMaterial[] = items.map(item => {
      let chargeMaterial: ChargeMaterial;
      if (item.type === ChargeMaterialType.Solid) {
        chargeMaterial = this.solidFormService.buildSolidChargeMaterial(item.form as SolidMaterialForm);
        chargeMaterial.name = item.name;
        if (chargeMaterial.solidChargeMaterial) chargeMaterial.solidChargeMaterial.heatRequired = item.heatRequired ?? undefined;
      } else if (item.type === ChargeMaterialType.Liquid) {
        chargeMaterial = this.liquidFormService.buildLiquidChargeMaterial(item.form as LiquidMaterialForm);
        chargeMaterial.name = item.name;
        if (chargeMaterial.liquidChargeMaterial) chargeMaterial.liquidChargeMaterial.heatRequired = item.heatRequired ?? undefined;
      } else {
        chargeMaterial = this.gasFormService.buildGasChargeMaterial(item.form as GasMaterialForm);
        chargeMaterial.name = item.name;
        if (chargeMaterial.gasChargeMaterial) chargeMaterial.gasChargeMaterial.heatRequired = item.heatRequired ?? undefined;
      }
      return chargeMaterial;
    });
    const current = this.assessmentService.processHeatingSignal();
    this.assessmentService.updateProcessHeatingProperty('losses', { ...current.losses, chargeMaterials });
  }
}
