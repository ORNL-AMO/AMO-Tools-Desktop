import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { FlueGasCompareService } from "../flue-gas-compare.service";
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from "../../../phast.service";
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-flue-gas-losses-form-volume',
  templateUrl: './flue-gas-losses-form-volume.component.html',
  styleUrls: ['./flue-gas-losses-form-volume.component.css']
})
export class FlueGasLossesFormVolumeComponent implements OnInit {
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
  @ViewChild('materialModal') public materialModal: ModalDirective;
  @Output('inputError')
  inputError = new EventEmitter<boolean>();

  firstChange: boolean = true;
  options: any;
  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  calculationExcessAir = 0.0;
  calculationFlueGasO2 = 0.0;
  calculationWarning: string = null;

  counter: any;
  showModal: boolean = false;
  calcMethodExcessAir: boolean;
  constructor(private suiteDbService: SuiteDbService, private flueGasCompareService: FlueGasCompareService, private windowRefService: WindowRefService, private lossesService: LossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.options = this.suiteDbService.selectGasFlueGasMaterials();
    if (this.flueGasLossForm) {
      if (this.flueGasLossForm.controls.gasTypeId.value && this.flueGasLossForm.controls.gasTypeId.value != '') {
        if (this.flueGasLossForm.controls.CH4.value == '' || !this.flueGasLossForm.controls.CH4.value) {
          this.setProperties();
        }
      }
    }
    this.setCalcMethod();
  }


  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  focusOut() {
    this.changeField.emit('default');
  }

  disableForm() {
    this.flueGasLossForm.disable();
  }

  checkForm() {
    this.calcExcessAir();
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  enableForm() {
    this.flueGasLossForm.enable();
  }

  changeMethod() {
    this.flueGasLossForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    })
    this.setCalcMethod();
  }

  setCalcMethod() {
    if (this.flueGasLossForm.controls.oxygenCalculationMethod.value == 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
    this.calcExcessAir();
  }

  calcExcessAir() {
    let input = {
      CH4: this.flueGasLossForm.controls.CH4.value,
      C2H6: this.flueGasLossForm.controls.C2H6.value,
      N2: this.flueGasLossForm.controls.N2.value,
      H2: this.flueGasLossForm.controls.H2.value,
      C3H8: this.flueGasLossForm.controls.C3H8.value,
      C4H10_CnH2n: this.flueGasLossForm.controls.C4H10_CnH2n.value,
      H2O: this.flueGasLossForm.controls.H2O.value,
      CO: this.flueGasLossForm.controls.CO.value,
      CO2: this.flueGasLossForm.controls.CO2.value,
      SO2: this.flueGasLossForm.controls.SO2.value,
      O2: this.flueGasLossForm.controls.O2.value,
      o2InFlueGas: this.flueGasLossForm.controls.o2InFlueGas.value,
      excessAir: this.flueGasLossForm.controls.excessAirPercentage.value
    };
    this.calculationWarning = null;
    if (!this.calcMethodExcessAir) {
      if (input.o2InFlueGas < 0 || input.o2InFlueGas > 20.99999) {
        this.calculationExcessAir = 0.0;
        this.calculationWarning = 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
      } else {
        this.calculationExcessAir = this.phastService.flueGasCalculateExcessAir(input);
      }
      this.flueGasLossForm.patchValue({
        excessAirPercentage: this.calculationExcessAir
      });
    }
    else {
      if (input.excessAir < 0) {
        this.calculationFlueGasO2 = 0.0;
        this.calculationWarning = 'Excess Air must be greater than 0 percent';
      } else {
        this.calculationFlueGasO2 = this.phastService.flueGasCalculateO2(input);
      }
      this.flueGasLossForm.patchValue({
        o2InFlueGas: this.calculationFlueGasO2
      });
    }
    if(this.calculationWarning){
      this.inputError.emit(true);
    }else{
      this.inputError.emit(false);
    }
  }

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectGasFlueGasMaterialById(this.flueGasLossForm.controls.gasTypeId.value);
    this.flueGasLossForm.patchValue({
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
    this.checkForm();
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }
  emitSave() {
    this.saveEmit.emit(true);
  }

  startSavePolling() {
    this.checkForm();
    this.emitSave();
  }

  initDifferenceMonitor() {
    if (this.flueGasCompareService.baselineFlueGasLoss && this.flueGasCompareService.modifiedFlueGasLoss && this.flueGasCompareService.differentArray.length != 0) {
      if (this.flueGasCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        // gasTypeId
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasVolumeDifferent.gasTypeId.subscribe((val) => {
          let gasTypeIdElements = doc.getElementsByName('gasTypeId_' + this.lossIndex);
          gasTypeIdElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        });
        // flueGasTemperature
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasVolumeDifferent.flueGasTemperature.subscribe((val) => {
          let flueGasTemperatureElements = doc.getElementsByName('flueGasTemperature_' + this.lossIndex);
          flueGasTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        });
        // excessAirPercentage
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasVolumeDifferent.excessAirPercentage.subscribe((val) => {
          let excessAirPercentageElements = doc.getElementsByName('excessAirPercentage_' + this.lossIndex);
          excessAirPercentageElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        });
        // combustionAirTemperature
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasVolumeDifferent.combustionAirTemperature.subscribe((val) => {
          let combustionAirTemperatureElements = doc.getElementsByName('combustionAirTemperature_' + this.lossIndex);
          combustionAirTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        });
        // fuelTemperature
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasVolumeDifferent.fuelTemperature.subscribe((val) => {
          let fuelTemperatureElements = doc.getElementsByName('fuelTemperature_' + this.lossIndex);
          fuelTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        });
        // Oxygen Calculation Method
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasVolumeDifferent.oxygenCalculationMethod.subscribe((val) => {
          let fuelTemperatureElements = doc.getElementsByName('fuelTemperature_' + this.lossIndex);
          fuelTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        });
      }
    }
  }

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.options = this.suiteDbService.selectGasFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance == event.substance })
      if (newMaterial.length != 0) {
        this.flueGasLossForm.patchValue({
          gasTypeId: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
    this.checkForm();
  }
}
