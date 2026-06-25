import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { generateFormControlIds, FormControlIds, roundVal } from '../../../../../shared/helperFunctions';
import { SolidLoadChargeMaterial } from '../../../../../shared/models/materials';
import { Settings } from '../../../../../shared/models/settings';
import { SolidMaterialForm, SolidMaterialFormService, SolidMaterialWarnings } from './solid-material-form.service';
import { TEMPERATURE_HTML } from '../../../../../shared/app-constants';
import { SolidLoadMaterialDbService } from '../../../../../indexedDb/solid-load-material-db.service';
import { ConvertValue } from '../../../../../shared/convert-units/ConvertValue';
import { ChargeMaterialService } from '../charge-material.service';
import { ThermicReactionType } from '../../../../../shared/models/phast/losses/chargeMaterial';

@Component({
  selector: 'app-charge-material-solid-form',
  standalone: false,
  templateUrl: './charge-material-solid-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargeMaterialSolidFormComponent implements OnInit {
  readonly index = input.required<number>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(SolidMaterialFormService);
  private readonly chargeMaterialService = inject(ChargeMaterialService);
  private readonly solidLoadMaterialDbService = inject(SolidLoadMaterialDbService);
  private readonly destroyRef = inject(DestroyRef);

  readonly materialTypes = signal<SolidLoadChargeMaterial[]>([]);
  readonly warnings = signal<SolidMaterialWarnings>({ dischargeTempWarning: null });
  readonly TEMPERATURE_HTML = TEMPERATURE_HTML;
  readonly ThermicReactionType = ThermicReactionType;

  readonly form = computed(() => this.chargeMaterialService.materials()[this.index()].form as SolidMaterialForm);
  controlIds: FormControlIds<SolidMaterialForm['controls']>;

  ngOnInit(): void {
    this.controlIds = generateFormControlIds(this.form().controls);
    this.solidLoadMaterialDbService.getAllWithObservable()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(materials => {
        this.materialTypes.set(materials);
        if (this.form().controls['materialId'].value && this.form().controls['materialLatentHeatOfFusion'].value === null) {
          this.setProperties();
        }
        this.checkWarnings();
      });

    this.form().controls['chargeMaterialDischargeTemperature'].valueChanges
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
      let meltingPoint = selected.meltingPoint;
      let specificHeatLiquid = selected.specificHeatLiquid;
      let specificHeatSolid = selected.specificHeatSolid;
      if (this.settings().unitsOfMeasure === 'Metric') {
        latentHeat = new ConvertValue(latentHeat, 'btuLb', 'kJkg').convertedValue;
        meltingPoint = new ConvertValue(meltingPoint, 'F', 'C').convertedValue;
        specificHeatLiquid = new ConvertValue(specificHeatLiquid, 'btulbF', 'kJkgC').convertedValue;
        specificHeatSolid = new ConvertValue(specificHeatSolid, 'btulbF', 'kJkgC').convertedValue;
      }
      this.form().patchValue({
        materialLatentHeatOfFusion: roundVal(latentHeat, 4),
        materialMeltingPoint: roundVal(meltingPoint, 4),
        materialHeatOfLiquid: roundVal(specificHeatLiquid, 4),
        materialSpecificHeatOfSolidMaterial: roundVal(specificHeatSolid, 4),
      });
    }
  }

  private checkWarnings(): void {
    const material = this.formService.buildSolidChargeMaterial(this.form()).solidChargeMaterial!;
    this.warnings.set(this.formService.checkSolidWarnings(material));
  }
}
