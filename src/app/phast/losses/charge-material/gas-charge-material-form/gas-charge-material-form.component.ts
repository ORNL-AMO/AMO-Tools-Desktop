import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';

@Component({
  selector: 'app-gas-charge-material-form',
  templateUrl: './gas-charge-material-form.component.html',
  styleUrls: ['./gas-charge-material-form.component.css']
})
export class GasChargeMaterialFormComponent implements OnInit {
  @Input()
  chargeMaterialForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  materialTypes: any;
  selectedMaterial: any;
  counter: any;
  constructor(private suiteDbService: SuiteDbService, private chargeMaterialCompareService: ChargeMaterialCompareService, private windowRefService: WindowRefService) { }

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

  ngOnInit() {
    this.materialTypes = this.suiteDbService.selectGasLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.value.materialId && this.chargeMaterialForm.value.materialId != '') {
        if (this.chargeMaterialForm.value.materialSpecificHeat == '') {
          this.setProperties();
        }
      }
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
    this.lossState.saved = false;
    if (this.chargeMaterialForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.value.materialId);
    this.chargeMaterialForm.patchValue({
      materialSpecificHeat: selectedMaterial.specificHeatVapor,
    });
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
    if (this.chargeMaterialCompareService.baselineMaterials && this.chargeMaterialCompareService.modifiedMaterials && this.chargeMaterialCompareService.differentArray.length != 0) {
      let doc = this.windowRefService.getDoc();

      //materialName
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.materialId.subscribe((val) => {
        let materialNameElements = doc.getElementsByName('materialName_' + this.lossIndex);
        materialNameElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //materialSpecificHeat
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.specificHeatGas.subscribe((val) => {
        let materialSpecificHeatElements = doc.getElementsByName('materialSpecificHeat_' + this.lossIndex);
        materialSpecificHeatElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //feedRate
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.feedRate.subscribe((val) => {
        let feedRateElements = doc.getElementsByName('feedRate_' + this.lossIndex);
        feedRateElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //vaporInGas
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.percentVapor.subscribe((val) => {
        let vaporInGasElements = doc.getElementsByName('vaporInGas_' + this.lossIndex);
        vaporInGasElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //initialTemperature
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.initialTemperature.subscribe((val) => {
        let initialTemperatureElements = doc.getElementsByName('initialTemperature_' + this.lossIndex);
        initialTemperatureElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //dischargeTemperature
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.dischargeTemperature.subscribe((val) => {
        let dischargeTemperatureElements = doc.getElementsByName('dischargeTemperature_' + this.lossIndex);
        dischargeTemperatureElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //specificHeatOfVapor
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.specificHeatVapor.subscribe((val) => {
        let specificHeatOfVaporElements = doc.getElementsByName('specificHeatOfVapor_' + this.lossIndex);
        specificHeatOfVaporElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //gasReacted
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.percentReacted.subscribe((val) => {
        let gasReactedElements = doc.getElementsByName('gasReacted_' + this.lossIndex);
        gasReactedElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //heatOfReaction
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.reactionHeat.subscribe((val) => {
        let heatOfReactionElements = doc.getElementsByName('heatOfReaction_' + this.lossIndex);
        heatOfReactionElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //endothermicOrExothermic
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.thermicReactionType.subscribe((val) => {
        let endothermicOrExothermicElements = doc.getElementsByName('endothermicOrExothermic_' + this.lossIndex);
        endothermicOrExothermicElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //additionalHeatRequired
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.gasChargeMaterialDifferent.additionalHeat.subscribe((val) => {
        let additionalHeatRequiredElements = doc.getElementsByName('additionalHeatRequired_' + this.lossIndex);
        additionalHeatRequiredElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
    }
  }
}
