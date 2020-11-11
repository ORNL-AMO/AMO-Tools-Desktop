import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { FlueGasWarnings } from '../../../../phast/losses/flue-gas-losses/flue-gas-losses.service';
import { PhastService } from '../../../../phast/phast.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGas, FlueGasByMass } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGasService } from '../flue-gas.service';

@Component({
  selector: 'app-flue-gas-form-mass',
  templateUrl: './flue-gas-form-mass.component.html',
  styleUrls: ['./flue-gas-form-mass.component.css']
})
export class FlueGasFormMassComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  inModal: boolean;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  coolingTowerOutputSub: Subscription;
  modificationDataSub: Subscription;

  byMassForm: FormGroup;
  options: any;

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  flueTemperatureWarning: boolean = false;
  tempMin: number;
  warnings: FlueGasWarnings;
;

  constructor(private flueGasService: FlueGasService, 
              private phastService: PhastService, 
              private suiteDbService: SuiteDbService,
              private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.byMassForm.disable();
      } else {
        this.byMassForm.enable();
      }
    }
  }

  initSubscriptions() {
    this.resetDataSub = this.flueGasService.resetData.subscribe(value => {
      this.setForm();
      })
    this.generateExampleSub = this.flueGasService.generateExample.subscribe(value => {
      this.setForm();
    })
  }

  initFormSetup() {
    if (this.selected == false) {
      this.byMassForm.disable();
    }
    if (this.byMassForm.controls.gasTypeId.value && this.byMassForm.controls.gasTypeId.value !== '') {
      if (this.byMassForm.controls.carbon.value === '') {
        this.setProperties();
      }
    }
    this.setCalcMethod();
    this.calcExcessAir();
    this.setCombustionValidation();
    this.setFuelTempValidation();
    this.tempMin = 212;
    this.tempMin = this.convertUnitsService.value(this.tempMin).from('F').to(this.settings.steamTemperatureMeasurement);
    this.tempMin = this.convertUnitsService.roundVal(this.tempMin, 1);
    this.calculate();
  }

  setForm() {
    let updatedFlueGasData: FlueGas;
    if (this.isBaseline) {
      let currentBaseline: FlueGas = this.flueGasService.baselineData.getValue();
      updatedFlueGasData = currentBaseline;
    } else {
      let currentModification: FlueGas = this.flueGasService.modificationData.getValue();
      updatedFlueGasData = currentModification;
    }

    if (updatedFlueGasData.flueGasByMass) {
      this.byMassForm = this.flueGasService.initByMassFormFromLoss(updatedFlueGasData);
    } else {
      this.byMassForm = this.flueGasService.initEmptyMassForm();
    }

    this.initFormSetup();
  }

  checkWarnings() {
    let tmpLoss: FlueGasByMass = this.flueGasService.buildByMassLossFromForm(this.byMassForm);
    this.warnings = this.flueGasService.setByMassWarnings(tmpLoss);
  }

  setCalcMethod() {
    if (this.byMassForm.controls.oxygenCalculationMethod.value === 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
  }
  
  calcExcessAir() {
    let input = {
      carbon: this.byMassForm.controls.carbon.value,
      hydrogen: this.byMassForm.controls.hydrogen.value,
      sulphur: this.byMassForm.controls.sulphur.value,
      inertAsh: this.byMassForm.controls.inertAsh.value,
      o2: this.byMassForm.controls.o2.value,
      moisture: this.byMassForm.controls.moisture.value,
      nitrogen: this.byMassForm.controls.nitrogen.value,
      moistureInAirCombustion: this.byMassForm.controls.moistureInAirComposition.value,
      o2InFlueGas: this.byMassForm.controls.o2InFlueGas.value,
      excessAir: this.byMassForm.controls.excessAirPercentage.value
    };

    if (!this.calcMethodExcessAir) {
      if (this.byMassForm.controls.o2InFlueGas.status === 'VALID') {
        this.calculationExcessAir = this.phastService.flueGasByMassCalculateExcessAir(input);
        this.byMassForm.patchValue({
          excessAirPercentage: this.calculationExcessAir
        });
      } else {
        this.calculationExcessAir = 0;
        this.byMassForm.patchValue({
          excessAirPercentage: this.calculationExcessAir
        });
      }
    }

    if (this.calcMethodExcessAir) {
      if (this.byMassForm.controls.excessAirPercentage.status === 'VALID') {
        this.calculationFlueGasO2 = this.phastService.flueGasByMassCalculateO2(input);
        this.byMassForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2
        });
      } else {
        this.calculationFlueGasO2 = 0;
        this.byMassForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2
        });
      }
    }
  }

  calculate() {
    this.checkFlueGasTemp();
    this.checkWarnings();
    if (this.isBaseline) {
      let currentBaselineData: FlueGas = this.flueGasService.baselineData.getValue();
      let currentBaselineByMass: FlueGasByMass = this.flueGasService.buildByMassLossFromForm(this.byMassForm)
      currentBaselineData.flueGasByMass = currentBaselineByMass;
      this.flueGasService.baselineData.next(currentBaselineData);
    } else { 
      let currentModificationData: FlueGas = this.flueGasService.modificationData.getValue();
      let currentModificationByMass: FlueGasByMass = this.flueGasService.buildByMassLossFromForm(this.byMassForm)
      currentModificationData.flueGasByMass = currentModificationByMass;
      this.flueGasService.modificationData.next(currentModificationData);
    }
  }

  focusField(str: string) {
    this.flueGasService.currentField.next(str);
  }

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.byMassForm.controls.gasTypeId.value);
    this.byMassForm.patchValue({
      carbon: this.roundVal(tmpFlueGas.carbon, 4),
      hydrogen: this.roundVal(tmpFlueGas.hydrogen, 4),
      sulphur: this.roundVal(tmpFlueGas.sulphur, 4),
      inertAsh: this.roundVal(tmpFlueGas.inertAsh, 4),
      o2: this.roundVal(tmpFlueGas.o2, 4),
      moisture: this.roundVal(tmpFlueGas.moisture, 4),
      nitrogen: this.roundVal(tmpFlueGas.nitrogen, 4)
    });
  }

  checkFlueGasTemp() {
    if (this.byMassForm.controls.flueGasTemperature.value && this.byMassForm.controls.flueGasTemperature.value < this.tempMin) {
      this.flueTemperatureWarning = true;
    } else {
      this.flueTemperatureWarning = false;
    }
  }

  changeMethod() {
    this.byMassForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.setCalcMethod();
  }

  setCombustionValidation() {
    this.byMassForm.controls.combustionAirTemperature.setValidators([Validators.required, Validators.max(this.byMassForm.controls.flueGasTemperature.value)]);
    this.byMassForm.controls.combustionAirTemperature.reset(this.byMassForm.controls.combustionAirTemperature.value);
    if (this.byMassForm.controls.combustionAirTemperature.value) {
      this.byMassForm.controls.combustionAirTemperature.markAsDirty();
    }
  }

  setFuelTempValidation() {
    this.byMassForm.controls.flueGasTemperature.setValidators([Validators.required, Validators.min(this.byMassForm.controls.combustionAirTemperature.value)]);
    this.byMassForm.controls.flueGasTemperature.reset(this.byMassForm.controls.flueGasTemperature.value);
    if (this.byMassForm.controls.flueGasTemperature.value) {
      this.byMassForm.controls.flueGasTemperature.markAsDirty();
    }
  }

  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  showMaterialModal() {
    this.flueGasService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.byMassForm.patchValue({
          gasTypeId: newMaterial[0].id
        });
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.flueGasService.modalOpen.next(false);
    this.calculate();
  }

}
