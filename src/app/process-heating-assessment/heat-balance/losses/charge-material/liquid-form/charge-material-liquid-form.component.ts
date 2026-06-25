import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { generateFormControlIds, FormControlIds, roundVal } from '../../../../../shared/helperFunctions';
import { LiquidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { Settings } from '../../../../../shared/models/settings';
import { LiquidMaterialForm, LiquidMaterialFormService, LiquidMaterialWarnings } from './liquid-material-form.service';
import { TEMPERATURE_HTML } from '../../../../../shared/app-constants';
import { LiquidLoadMaterialDbService } from '../../../../../indexedDb/liquid-load-material-db.service';
import { ConvertValue } from '../../../../../shared/convert-units/ConvertValue';
import { ChargeMaterialService } from '../charge-material.service';
import { ThermicReactionType } from '../../../../../shared/models/phast/losses/chargeMaterial';

@Component({
  selector: 'app-charge-material-liquid-form',
  standalone: false,
  templateUrl: './charge-material-liquid-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargeMaterialLiquidFormComponent implements OnInit {
  readonly index = input.required<number>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(LiquidMaterialFormService);
  private readonly chargeMaterialService = inject(ChargeMaterialService);
  private readonly liquidLoadMaterialDbService = inject(LiquidLoadMaterialDbService);
  private readonly destroyRef = inject(DestroyRef);

  readonly materialTypes = signal<LiquidLoadChargeMaterial[]>([]);
  readonly warnings = signal<LiquidMaterialWarnings>({ dischargeTempWarning: null, inletOverVaporizingWarning: null, outletOverVaporizingWarning: null });
  readonly TEMPERATURE_HTML = TEMPERATURE_HTML;
  readonly ThermicReactionType = ThermicReactionType;

  readonly form = computed(() => this.chargeMaterialService.materials()[this.index()].form as LiquidMaterialForm);
  controlIds: FormControlIds<LiquidMaterialForm['controls']>;

  ngOnInit(): void {
    this.controlIds = generateFormControlIds(this.form().controls);
    this.liquidLoadMaterialDbService.getAllWithObservable()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(materials => {
        this.materialTypes.set(materials);
        if (this.form().controls['materialId'].value && this.form().controls['materialSpecificHeatLiquid'].value === null) {
          this.setProperties();
        }
        this.checkWarnings();
      });

    this.form().controls['dischargeTemperature'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formService.setInitialTempValidator(this.form()));

    this.form().valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.checkWarnings();
        this.chargeMaterialService.updateItem(this.index());
      });
  }

  setProperties(): void {
    const selected = this.materialTypes().find(mat => mat.id === this.form().controls['materialId'].value);
    if (selected) {
      let latentHeat = selected.latentHeat;
      let specificHeatLiquid = selected.specificHeatLiquid;
      let specificHeatVapor = selected.specificHeatVapor;
      let vaporizingTemperature = selected.vaporizationTemperature;
      if (this.settings().unitsOfMeasure === 'Metric') {
        latentHeat = new ConvertValue(latentHeat, 'btuLb', 'kJkg').convertedValue;
        specificHeatLiquid = new ConvertValue(specificHeatLiquid, 'btulbF', 'kJkgC').convertedValue;
        specificHeatVapor = new ConvertValue(specificHeatVapor, 'btulbF', 'kJkgC').convertedValue;
        vaporizingTemperature = new ConvertValue(vaporizingTemperature, 'F', 'C').convertedValue;
      }
      this.form().patchValue({
        materialLatentHeat: roundVal(latentHeat, 4),
        materialSpecificHeatLiquid: roundVal(specificHeatLiquid, 4),
        materialSpecificHeatVapor: roundVal(specificHeatVapor, 4),
        materialVaporizingTemperature: roundVal(vaporizingTemperature, 4),
      });
    }
  }

  private checkWarnings(): void {
    const material = this.formService.buildLiquidChargeMaterial(this.form()).liquidChargeMaterial!;
    this.warnings.set(this.formService.checkLiquidWarnings(material));
  }
}
