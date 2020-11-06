import { Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { PhastService } from '../../../../phast/phast.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FlueGas, FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGasService } from '../flue-gas.service';

@Component({
  selector: 'app-flue-gas-form-volume',
  templateUrl: './flue-gas-form-volume.component.html',
  styleUrls: ['./flue-gas-form-volume.component.css']
})
export class FlueGasFormVolumeComponent implements OnInit, OnDestroy {

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

  byVolumeForm: FormGroup;

  options: any;
  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];
  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  stackTemperatureWarning: boolean = false;
  tempMin: number;

  constructor(private flueGasService: FlueGasService, 
              private phastService: PhastService, 
              private suiteDbService: SuiteDbService,
              private convertUnitsService: ConvertUnitsService) {
  }

  ngOnInit() {
    this.options = this.suiteDbService.selectGasFlueGasMaterials();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.byVolumeForm.disable();
      } else {
        this.byVolumeForm.enable();
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
      this.byVolumeForm.disable();
    }
    if (this.byVolumeForm.controls.gasTypeId.value && this.byVolumeForm.controls.gasTypeId.value !== '') {
      if (this.byVolumeForm.controls.CH4.value === '' || !this.byVolumeForm.controls.CH4.value) {
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
    this.checkStackLossTemp();
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

    if (updatedFlueGasData.flueGasByVolume) {
      this.byVolumeForm = this.flueGasService.initByVolumeFormFromLoss(updatedFlueGasData);
    } else {
      this.byVolumeForm = this.flueGasService.initEmptyVolumeForm();
    }
    this.initFormSetup();
  }

  setCalcMethod() {
    if (this.byVolumeForm.controls.oxygenCalculationMethod.value === 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
  }
  
  // TODO move to service
  calcExcessAir() {
    let input = {
      CH4: this.byVolumeForm.controls.CH4.value,
      C2H6: this.byVolumeForm.controls.C2H6.value,
      N2: this.byVolumeForm.controls.N2.value,
      H2: this.byVolumeForm.controls.H2.value,
      C3H8: this.byVolumeForm.controls.C3H8.value,
      C4H10_CnH2n: this.byVolumeForm.controls.C4H10_CnH2n.value,
      H2O: this.byVolumeForm.controls.H2O.value,
      CO: this.byVolumeForm.controls.CO.value,
      CO2: this.byVolumeForm.controls.CO2.value,
      SO2: this.byVolumeForm.controls.SO2.value,
      O2: this.byVolumeForm.controls.O2.value,
      o2InFlueGas: this.byVolumeForm.controls.o2InFlueGas.value,
      excessAir: this.byVolumeForm.controls.excessAirPercentage.value
    };

    if (!this.calcMethodExcessAir) {
      if (this.byVolumeForm.controls.o2InFlueGas.status === 'VALID') {
        this.calculationExcessAir = this.phastService.flueGasCalculateExcessAir(input);
        this.byVolumeForm.patchValue({
          excessAirPercentage: this.calculationExcessAir,
        });
      } else {
        this.calculationExcessAir = 0;
        this.byVolumeForm.patchValue({
          excessAirPercentage: this.calculationExcessAir,
        });
      }
    }

    if (this.calcMethodExcessAir) {
      if (this.byVolumeForm.controls.excessAirPercentage.status === 'VALID') {
        this.calculationFlueGasO2 = this.phastService.flueGasCalculateO2(input);
        this.byVolumeForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2,
        });
      } else {
        this.calculationFlueGasO2 = 0;
        this.byVolumeForm.patchValue({
          o2InFlueGas: this.calculationFlueGasO2,
        });
      }
    }
    this.calculate();
  }

  // checkWarnings() {
  //   let tmpLoss: FlueGasByVolume = this.flueGasLossesService.buildByVolumeLossFromForm(this.flueGasLossForm).flueGasByVolume;
  //   this.warnings = this.flueGasLossesService.checkFlueGasByVolumeWarnings(tmpLoss);
  //   let hasWarning: boolean = this.flueGasLossesService.checkWarningsExist(this.warnings);
  //   this.inputError.emit(hasWarning);
  // }
  
  calculate() {
    // this.checkWarnings();
    if (this.isBaseline) {
      let currentBaselineData: FlueGas = this.flueGasService.baselineData.getValue();
      let currentBaselineByVolume: FlueGasByVolume = this.flueGasService.buildByVolumeLossFromForm(this.byVolumeForm)
      currentBaselineData.flueGasByVolume = currentBaselineByVolume;
      this.flueGasService.baselineData.next(currentBaselineData);
    } else {
      let currentModificationData: FlueGas = this.flueGasService.modificationData.getValue();
      let currentModificationByVolume: FlueGasByVolume = this.flueGasService.buildByVolumeLossFromForm(this.byVolumeForm)
      currentModificationData.flueGasByVolume = currentModificationByVolume;
      this.flueGasService.modificationData.next(currentModificationData);
    }
  }

  focusField(str: string) {
    this.flueGasService.currentField.next(str);
  }

  setFuelTemp() {
    this.byVolumeForm.patchValue({
      fuelTemperature: this.byVolumeForm.controls.combustionAirTemperature.value
    });
    this.calculate();
  }

  changeMethod() {
    this.byVolumeForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.setCalcMethod();
  }

  checkStackLossTemp() {
    if (this.byVolumeForm.controls.flueGasTemperature.value && this.byVolumeForm.controls.flueGasTemperature.value < this.tempMin) {
      this.stackTemperatureWarning = true;
    } else {
      this.stackTemperatureWarning = false;
    }
  }

  setCombustionValidation() {
    this.byVolumeForm.controls.combustionAirTemperature.setValidators([Validators.required, Validators.max(this.byVolumeForm.controls.flueGasTemperature.value)]);
    this.byVolumeForm.controls.combustionAirTemperature.reset(this.byVolumeForm.controls.combustionAirTemperature.value);
    if (this.byVolumeForm.controls.combustionAirTemperature.value) {
      this.byVolumeForm.controls.combustionAirTemperature.markAsDirty();
    }
  }

  setFuelTempValidation() {
    this.byVolumeForm.controls.flueGasTemperature.setValidators([Validators.required, Validators.min(this.byVolumeForm.controls.combustionAirTemperature.value)]);
    this.byVolumeForm.controls.flueGasTemperature.reset(this.byVolumeForm.controls.flueGasTemperature.value);
    if (this.byVolumeForm.controls.flueGasTemperature.value) {
      this.byVolumeForm.controls.flueGasTemperature.markAsDirty();
    }
  }

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectGasFlueGasMaterialById(this.byVolumeForm.controls.gasTypeId.value);
    this.byVolumeForm.patchValue({
      CH4: this.roundVal(tmpFlueGas.CH4, 4),
      C2H6: this.roundVal(tmpFlueGas.C2H6, 4),
      N2: this.roundVal(tmpFlueGas.N2, 4),
      H2: this.roundVal(tmpFlueGas.H2, 4),
      C3H8: this.roundVal(tmpFlueGas.C3H8, 4),
      C4H10_CnH2n: this.roundVal(tmpFlueGas.C4H10_CnH2n, 4),
      H2O: this.roundVal(tmpFlueGas.H2O, 4),
      CO: this.roundVal(tmpFlueGas.CO, 4),
      CO2: this.roundVal(tmpFlueGas.CO2, 4),
      SO2: this.roundVal(tmpFlueGas.SO2, 4),
      O2: this.roundVal(tmpFlueGas.O2, 4)
    });
    this.calculate();
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
        this.byVolumeForm.patchValue({
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