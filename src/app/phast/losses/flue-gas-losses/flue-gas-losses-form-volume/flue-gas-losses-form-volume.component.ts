import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { FlueGasCompareService } from "../flue-gas-compare.service";
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from "../../../phast.service";

@Component({
  selector: 'app-flue-gas-losses-form-volume',
  templateUrl: './flue-gas-losses-form-volume.component.html',
  styleUrls: ['./flue-gas-losses-form-volume.component.css']
})
export class FlueGasLossesFormVolumeComponent implements OnInit {
  @Input()
  flueGasLossForm: any;
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
  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;


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
      if (this.flueGasLossForm.value.gasTypeId && this.flueGasLossForm.value.gasTypeId != '') {
        if (this.flueGasLossForm.value.CH4 == '' || !this.flueGasLossForm.value.CH4) {
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
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }

  checkForm() {
    this.calcExcessAir();
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  changeMethod() {
    this.flueGasLossForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    })
    this.setCalcMethod();
  }

  setCalcMethod() {
    if (this.flueGasLossForm.value.oxygenCalculationMethod == 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
    this.calcExcessAir();
  }

  calcExcessAir() {
    let input = {
      CH4: this.flueGasLossForm.value.CH4,
      C2H6: this.flueGasLossForm.value.C2H6,
      N2: this.flueGasLossForm.value.N2,
      H2: this.flueGasLossForm.value.H2,
      C3H8: this.flueGasLossForm.value.C3H8,
      C4H10_CnH2n: this.flueGasLossForm.value.C4H10_CnH2n,
      H2O: this.flueGasLossForm.value.H2O,
      CO: this.flueGasLossForm.value.CO,
      CO2: this.flueGasLossForm.value.CO2,
      SO2: this.flueGasLossForm.value.SO2,
      O2: this.flueGasLossForm.value.O2,
      o2InFlueGas: this.flueGasLossForm.value.o2InFlueGas,
      excessAir: this.flueGasLossForm.value.excessAirPercentage
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
  }

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectGasFlueGasMaterialById(this.flueGasLossForm.value.gasTypeId);
    this.flueGasLossForm.patchValue({
      CH4: tmpFlueGas.CH4,
      C2H6: tmpFlueGas.C2H6,
      N2: tmpFlueGas.N2,
      H2: tmpFlueGas.H2,
      C3H8: tmpFlueGas.C3H8,
      C4H10_CnH2n: tmpFlueGas.C4H10_CnH2n,
      H2O: tmpFlueGas.H2O,
      CO: tmpFlueGas.CO,
      CO2: tmpFlueGas.CO2,
      SO2: tmpFlueGas.SO2,
      O2: tmpFlueGas.O2,
    });
    this.checkForm();
  }

  emitSave() {
    this.saveEmit.emit(true);
  }

  startSavePolling() {
    this.checkForm();
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave();
    }, 3000)
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
