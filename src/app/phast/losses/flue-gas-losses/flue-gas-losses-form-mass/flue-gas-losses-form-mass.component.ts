import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { FlueGasCompareService } from "../flue-gas-compare.service";
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';

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

  firstChange: boolean = true;
  options: any;
  counter: any;
  showModal: boolean = false;
  constructor(private suiteDbService: SuiteDbService, private flueGasCompareService: FlueGasCompareService, private windowRefService: WindowRefService, private lossesService: LossesService) { }

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
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
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