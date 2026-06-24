import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { generateFormControlIds, FormControlIds, roundVal } from '../../../../../shared/helperFunctions';
import { GasLoadChargeMaterial } from '../../../../../shared/models/materials';
import { Settings } from '../../../../../shared/models/settings';
import { GasMaterialForm, GasMaterialFormService } from './gas-material-form.service';
import { TEMPERATURE_HTML } from '../../../../../shared/app-constants';
import { GasLoadMaterialDbService } from '../../../../../indexedDb/gas-load-material-db.service';
import { ConvertValue } from '../../../../../shared/convert-units/ConvertValue';
import { ChargeMaterialService } from '../charge-material.service';

@Component({
  selector: 'app-charge-material-gas-form',
  standalone: false,
  templateUrl: './charge-material-gas-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargeMaterialGasFormComponent implements OnInit {
  readonly index = input.required<number>();
  readonly settings = input.required<Settings>();

  private readonly formService = inject(GasMaterialFormService);
  private readonly chargeMaterialService = inject(ChargeMaterialService);
  private readonly gasLoadMaterialDbService = inject(GasLoadMaterialDbService);
  private readonly destroyRef = inject(DestroyRef);

  readonly materialTypes = signal<GasLoadChargeMaterial[]>([]);
  readonly TEMPERATURE_HTML = TEMPERATURE_HTML;

  readonly form = computed(() => this.chargeMaterialService.materials()[this.index()].form as GasMaterialForm);
  controlIds: FormControlIds<GasMaterialForm['controls']>;

  ngOnInit(): void {
    this.controlIds = generateFormControlIds(this.form().controls);
    this.gasLoadMaterialDbService.getAllWithObservable()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(materials => this.materialTypes.set(materials));

    this.form().controls['dischargeTemperature'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.formService.setInitialTempValidator(this.form()));

    this.form().valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.chargeMaterialService.updateItem(this.index()));
  }

  setProperties(): void {
    const selectedMaterial = this.materialTypes().find(mat => mat.id === this.form().controls['materialId'].value);
    if (selectedMaterial) {
      let specificHeatVapor = selectedMaterial.specificHeatVapor;
      if (this.settings().unitsOfMeasure === 'Metric') {
        specificHeatVapor = new ConvertValue(specificHeatVapor, 'btulbF', 'kJkgC').convertedValue;
      }
      this.form().patchValue({
        materialSpecificHeat: roundVal(specificHeatVapor, 4),
      });
    }
  }
}
