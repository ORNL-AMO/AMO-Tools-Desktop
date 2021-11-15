import { Component, OnInit, Input, EventEmitter, Output, ViewChild, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FlueGasCompareService } from "../flue-gas-compare.service";
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from "../../../phast.service";
import { FormGroup } from '@angular/forms';
import { BaseGasDensity } from '../../../../shared/models/fans';
import { FlueGasByMass, FlueGasWarnings, MaterialInputProperties } from '../../../../shared/models/phast/losses/flueGas';
import { FlueGasFormService } from '../../../../calculator/furnaces/flue-gas/flue-gas-form.service';
import { SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';

@Component({
  selector: 'app-flue-gas-losses-form-mass',
  templateUrl: './flue-gas-losses-form-mass.component.html',
  styleUrls: ['./flue-gas-losses-form-mass.component.css']
})
export class FlueGasLossesFormMassComponent implements OnInit {
  @Input()
  flueGasLossForm: FormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  settings: Settings;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  @ViewChild('moistureModal', { static: false }) public moistureModal: ModalDirective;

  warnings: FlueGasWarnings;
  options: Array<SolidLiquidFlueGasMaterial>;
  showModal: boolean = false;
  showMoisture: boolean = false;
  baseGasDensity: BaseGasDensity = {
    barometricPressure: 29.92,
    dewPoint: 0,
    dryBulbTemp: 68,
    gasDensity: 0.07516579558441701,
    gasType: "AIR",
    inputType: "relativeHumidity",
    relativeHumidity: 0,
    specificGravity: 1,
    specificHeatGas: 0.24,
    specificHeatRatio: 1.4,
    staticPressure: 0,
    wetBulbTemp: 118.999
  }

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  calculationExcessAir = 0.0;
  calculationFlueGasO2 = 0.0;
  idString: string;
  constructor(
    private sqlDbApiService: SqlDbApiService, 
    private flueGasFormService: FlueGasFormService,
    private flueGasCompareService: FlueGasCompareService,
    private lossesService: LossesService, private phastService: PhastService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification_' + this.lossIndex;
    }
    else {
      this.idString = '_baseline_' + this.lossIndex;
    }
    this.options = this.sqlDbApiService.selectSolidLiquidFlueGasMaterials();
    if (this.flueGasLossForm) {
      if (this.flueGasLossForm.controls.gasTypeId.value && this.flueGasLossForm.controls.gasTypeId.value !== '') {
        if (this.flueGasLossForm.controls.carbon.value === 0) {
          this.setProperties();
        }
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.calcExcessAir();
    this.checkWarnings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.baselineSelected) {
      if (!changes.baselineSelected.firstChange) {
        if (!this.baselineSelected) {
          this.disableForm();
        } else {
          this.options = this.sqlDbApiService.selectSolidLiquidFlueGasMaterials();
          this.enableForm();
        }
      }
    }
  }

  focusOut() {
    this.changeField.emit('default');
  }
  disableForm() {
    this.flueGasLossForm.controls.gasTypeId.disable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.disable();
  }

  enableForm() {
    this.flueGasLossForm.controls.gasTypeId.enable();
    this.flueGasLossForm.controls.oxygenCalculationMethod.enable();
  }


  focusField(str: string) {
    this.changeField.emit(str);
  }

  changeMethod() {
    this.flueGasLossForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.calcExcessAir();
  }

  calcExcessAir() {
    let input: MaterialInputProperties = {
      carbon: this.flueGasLossForm.controls.carbon.value,
      hydrogen: this.flueGasLossForm.controls.hydrogen.value,
      sulphur: this.flueGasLossForm.controls.sulphur.value,
      inertAsh: this.flueGasLossForm.controls.inertAsh.value,
      o2: this.flueGasLossForm.controls.o2.value,
      moisture: this.flueGasLossForm.controls.moisture.value,
      nitrogen: this.flueGasLossForm.controls.nitrogen.value,
      moistureInAirCombustion: this.flueGasLossForm.controls.moistureInAirCombustion.value,
      o2InFlueGas: this.flueGasLossForm.controls.o2InFlueGas.value,
      excessAir: this.flueGasLossForm.controls.excessAirPercentage.value
    };

    if (this.flueGasLossForm.controls.oxygenCalculationMethod.value === 'Oxygen in Flue Gas') {
      if (input.o2InFlueGas < 0 || input.o2InFlueGas > 20.99999) {
        this.calculationExcessAir = 0.0;
      } else {
        this.calculationExcessAir = this.phastService.flueGasByMassCalculateExcessAir(input);
      }
      this.flueGasLossForm.patchValue({
        excessAirPercentage: this.calculationExcessAir
      });
    } else if (this.flueGasLossForm.controls.oxygenCalculationMethod.value === 'Excess Air') {
      if (input.excessAir < 0) {
        this.calculationFlueGasO2 = 0.0;
      } else {
        // bandaid
        if (input.moistureInAirCombustion === undefined) {
          input.moistureInAirCombustion = null;
        }
        this.calculationFlueGasO2 = this.phastService.flueGasByMassCalculateO2(input);
      }
      this.flueGasLossForm.patchValue({
        o2InFlueGas: this.calculationFlueGasO2
      });
    }
    this.save();
  }

  setProperties() {
    let tmpFlueGas: SolidLiquidFlueGasMaterial = this.sqlDbApiService.selectSolidLiquidFlueGasMaterialById(this.flueGasLossForm.controls.gasTypeId.value);
    if (tmpFlueGas) {
      this.flueGasLossForm.patchValue({
        carbon: this.roundVal(tmpFlueGas.carbon, 4),
        hydrogen: this.roundVal(tmpFlueGas.hydrogen, 4),
        sulphur: this.roundVal(tmpFlueGas.sulphur, 4),
        inertAsh: this.roundVal(tmpFlueGas.inertAsh, 4),
        o2: this.roundVal(tmpFlueGas.o2, 4),
        moisture: this.roundVal(tmpFlueGas.moisture, 4),
        nitrogen: this.roundVal(tmpFlueGas.nitrogen, 4)
      });
    }
    this.save();
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  save() {
    this.flueGasLossForm = this.flueGasFormService.setValidators(this.flueGasLossForm);
    this.checkWarnings();

    // backend method needs moistureInAirCombustion to be ''
    // moistureInAirCombustion is "" before saveEmit and undefined after
    this.saveEmit.emit(true);

    // this.calculate should emit a loss object, though still working with this boolean
    this.calculate.emit(true);
  }

  checkWarnings() {
    let tmpLoss: FlueGasByMass = this.flueGasFormService.buildByMassLossFromForm(this.flueGasLossForm).flueGasByMass;
    this.warnings = this.flueGasFormService.checkFlueGasByMassWarnings(tmpLoss, this.settings);
    let hasWarning: boolean = this.flueGasFormService.checkWarningsExist(this.warnings);
    this.inputError.emit(hasWarning);
  }

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  showMoistureModal() {
    this.showMoisture = true;
    this.lossesService.modalOpen.next(this.showMoisture);
    this.moistureModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.options = this.sqlDbApiService.selectSolidLiquidFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.flueGasLossForm.patchValue({
          gasTypeId: newMaterial[0].id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
  }

  hideMoistureModal(moistureInAirCombustion?: number) {
    if (moistureInAirCombustion) {
      moistureInAirCombustion = Number(moistureInAirCombustion.toFixed(2));
      this.flueGasLossForm.controls.moistureInAirCombustion.patchValue(moistureInAirCombustion);
    }
    this.moistureModal.hide();
    this.showMoisture = false;
    this.lossesService.modalOpen.next(this.showMoisture);
    this.save();
  }

  canCompare() {
    if (this.flueGasCompareService.baselineFlueGasLoss && this.flueGasCompareService.modifiedFlueGasLoss && !this.inSetup) {
      if (this.flueGasCompareService.compareLossType(this.lossIndex) === false) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  compareMassGasTypeId() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassGasTypeId(this.lossIndex);
    } else {
      return false;
    }
  }

  compareMassFlueGasTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassFlueGasTemperature(this.lossIndex);
    } else {
      return false;
    }
  }

  compareMassAmbientAirTemp() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassAmbientAirTemp(this.lossIndex);
    } else {
      return false;
    }
  }
  
  compareMassExcessAirPercentage() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassExcessAirPercentage(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassCombustionAirTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassCombustionAirTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassFuelTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassFuelTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassAshDischargeTemperature() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassAshDischargeTemperature(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassMoistureInAirCombustion() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassMoistureInAirCombustion(this.lossIndex);
    } else {
      return false;
    }
  }
  compareMassUnburnedCarbonInAsh() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassUnburnedCarbonInAsh(this.lossIndex);
    } else {
      return false;
    }
  }

  compareMassOxygenCalculationMethod() {
    if (this.canCompare()) {
      return this.flueGasCompareService.compareMassOxygenCalculationMethod(this.lossIndex);
    } else {
      return false;
    }
  }
}
