import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { FlueGasCompareService } from "../flue-gas-compare.service";
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { PhastService } from "../../../phast.service";

@Component({
  selector: 'app-flue-gas-losses-form-mass',
  templateUrl: './flue-gas-losses-form-mass.component.html',
  styleUrls: ['./flue-gas-losses-form-mass.component.css']
})
export class FlueGasLossesFormMassComponent implements OnInit {
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
  moistureInAirCompositionError: string = null;
  unburnedCarbonInAshError: string = null;
  firstChange: boolean = true;
  options: any;
  counter: any;
  showModal: boolean = false;

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  calculationExcessAir = 0.0;
  calculationFlueGasO2 = 0.0;
  calculationWarning: string = null;
  calcMethodExcessAir: boolean;

  constructor(private suiteDbService: SuiteDbService, private flueGasCompareService: FlueGasCompareService, private windowRefService: WindowRefService,
    private lossesService: LossesService, private phastService: PhastService) { }

  ngOnInit() {
    this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    if (this.flueGasLossForm) {
      if (this.flueGasLossForm.value.gasTypeId && this.flueGasLossForm.value.gasTypeId != '') {
        if (this.flueGasLossForm.value.carbon == '') {
          this.setProperties();
        }
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.setCalcMethod();
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

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
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

  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  checkForm() {
    this.calcExcessAir();
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  changeMethod() {
    this.flueGasLossForm.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
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
      carbon: this.flueGasLossForm.value.carbon,
      hydrogen: this.flueGasLossForm.value.hydrogen,
      sulphur: this.flueGasLossForm.value.sulphur,
      inertAsh: this.flueGasLossForm.value.inertAsh,
      o2: this.flueGasLossForm.value.o2,
      moisture: this.flueGasLossForm.value.moisture,
      nitrogen: this.flueGasLossForm.value.nitrogen,
      moistureInAirCombustion: this.flueGasLossForm.value.moistureInAirComposition,
      o2InFlueGas: this.flueGasLossForm.value.o2InFlueGas,
      excessAir: this.flueGasLossForm.value.excessAirPercentage
    };
    this.calculationWarning = null;
    if (!this.calcMethodExcessAir) {
      if (input.o2InFlueGas < 0 || input.o2InFlueGas > 20.99999) {
        this.calculationExcessAir = 0.0;
        this.calculationWarning = 'Oxygen levels in Flue Gas must be greater than or equal to 0 and less than 21 percent';
      } else {
        this.calculationExcessAir = this.phastService.flueGasByMassCalculateExcessAir(input);
      }
      this.flueGasLossForm.patchValue({
        excessAirPercentage: this.calculationExcessAir
      });
    } else {
      if (input.excessAir < 0) {
        this.calculationFlueGasO2 = 0.0;

        this.calculationWarning = 'Excess Air must be greater than 0 percent';
      } else {
        this.calculationFlueGasO2 = this.phastService.flueGasByMassCalculateO2(input);
      }
      this.flueGasLossForm.patchValue({
        o2InFlueGas: this.calculationFlueGasO2
      });
    }
  }

  setProperties() {
    let tmpFlueGas = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.flueGasLossForm.value.gasTypeId);
    this.flueGasLossForm.patchValue({
      carbon: tmpFlueGas.carbon,
      hydrogen: tmpFlueGas.hydrogen,
      sulphur: tmpFlueGas.sulphur,
      inertAsh: tmpFlueGas.inertAsh,
      o2: tmpFlueGas.o2,
      moisture: tmpFlueGas.moisture,
      nitrogen: tmpFlueGas.nitrogen
    })
    this.checkForm();
  }
  emitSave() {
    this.saveEmit.emit(true);
  }

  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.flueGasLossForm.value.moistureInAirComposition < 0) {
      this.moistureInAirCompositionError = 'Moisture in Air Combustion must be equal or greater than 0';
    } else {
      this.moistureInAirCompositionError = null;
    }
    if (this.flueGasLossForm.value.unburnedCarbonInAsh < 0 || this.flueGasLossForm.value.unburnedCarbonInAsh > 100) {
      this.unburnedCarbonInAshError = 'Unburned Carbon in Ash must be equal or greater than 0 and less than or equal to 100%';
    } else {
      this.unburnedCarbonInAshError = null;
    }
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

        //gasTypeId
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasMassDifferent.gasTypeId.subscribe((val) => {
          let gasTypeIdElements = doc.getElementsByName('gasTypeId_' + this.lossIndex);
          gasTypeIdElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //flueGasTemperature
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasMassDifferent.flueGasTemperature.subscribe((val) => {
          let flueGasTemperatureElements = doc.getElementsByName('flueGasTemperature_' + this.lossIndex);
          flueGasTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //excessAirPercentage
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasMassDifferent.excessAirPercentage.subscribe((val) => {
          let excessAirPercentageElements = doc.getElementsByName('excessAirPercentage_' + this.lossIndex);
          excessAirPercentageElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //combustionAirTemperature
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasMassDifferent.combustionAirTemperature.subscribe((val) => {
          let combustionAirTemperatureElements = doc.getElementsByName('combustionAirTemperature_' + this.lossIndex);
          combustionAirTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //fuelTemperature
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasMassDifferent.fuelTemperature.subscribe((val) => {
          let fuelTemperatureElements = doc.getElementsByName('fuelTemperature_' + this.lossIndex);
          fuelTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //moistureInAirComposition
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasMassDifferent.moistureInAirComposition.subscribe((val) => {
          let moistureInAirCompositionElements = doc.getElementsByName('moistureInAirComposition_' + this.lossIndex);
          moistureInAirCompositionElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //ashDischargeTemperature
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasMassDifferent.ashDischargeTemperature.subscribe((val) => {
          let ashDischargeTemperatureElements = doc.getElementsByName('ashDischargeTemperature_' + this.lossIndex);
          ashDischargeTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //unburnedCarbonInAsh
        this.flueGasCompareService.differentArray[this.lossIndex].different.flueGasMassDifferent.unburnedCarbonInAsh.subscribe((val) => {
          let unburnedCarbonInAshElements = doc.getElementsByName('unburnedCarbonInAsh_' + this.lossIndex);
          unburnedCarbonInAshElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
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
      this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
      let newMaterial = this.options.filter(material => { return material.substance == event.substance });
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
