import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
@Component({
  selector: 'app-liquid-charge-material-form',
  templateUrl: './liquid-charge-material-form.component.html',
  styleUrls: ['./liquid-charge-material-form.component.css']
})
export class LiquidChargeMaterialFormComponent implements OnInit {
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
    this.materialTypes = this.suiteDbService.selectLiquidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.value.materialId && this.chargeMaterialForm.value.materialId != '') {
        if (this.chargeMaterialForm.value.materialLatentHeat == '') {
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
    let selectedMaterial = this.suiteDbService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.value.materialId);
    this.chargeMaterialForm.patchValue({
      materialLatentHeat: selectedMaterial.latentHeat,
      materialSpecificHeatLiquid: selectedMaterial.specificHeatLiquid,
      materialSpecificHeatVapor: selectedMaterial.specificHeatVapor,
      materialVaporizingTemperature: selectedMaterial.vaporizationTemperature
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
    if (this.chargeMaterialCompareService.baselineMaterials && this.chargeMaterialCompareService.modifiedMaterials && this.chargeMaterialCompareService.differentArray.length != 0) {
      let doc = this.windowRefService.getDoc();
      //materialName
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.materialId.subscribe((val) => {
        let materialNameElements = doc.getElementsByName('materialName_' + this.lossIndex);
        materialNameElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //materialSpecificHeatLiquid
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.specificHeatLiquid.subscribe((val) => {
        let materialSpecificHeatLiquidElements = doc.getElementsByName('materialSpecificHeatLiquid_' + this.lossIndex);
        materialSpecificHeatLiquidElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //materialVaporizingTemperature
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.vaporizingTemperature.subscribe((val) => {
        let materialVaporizingTemperatureElements = doc.getElementsByName('materialVaporizingTemperature_' + this.lossIndex);
        materialVaporizingTemperatureElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //materialLatentHeat
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.latentHeat.subscribe((val) => {
        let materialLatentHeatElements = doc.getElementsByName('materialLatentHeat_' + this.lossIndex);
        materialLatentHeatElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //materialSpecificHeatVapor
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.specificHeatVapor.subscribe((val) => {
        let materialSpecificHeatVaporElements = doc.getElementsByName('materialSpecificHeatVapor_' + this.lossIndex);
        materialSpecificHeatVaporElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //feedRate
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.chargeFeedRate.subscribe((val) => {
        let feedRateElements = doc.getElementsByName('feedRate_' + this.lossIndex);
        feedRateElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //initialTemperature
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.initialTemperature.subscribe((val) => {
        let initialTemperatureElements = doc.getElementsByName('initialTemperature_' + this.lossIndex);
        initialTemperatureElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //dischargeTemperature
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.dischargeTemperature.subscribe((val) => {
        let dischargeTemperatureElements = doc.getElementsByName('dischargeTemperature_' + this.lossIndex);
        dischargeTemperatureElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //liquidVaporized
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.percentVaporized.subscribe((val) => {
        let liquidVaporizedElements = doc.getElementsByName('liquidVaporized_' + this.lossIndex);
        liquidVaporizedElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //liquidReacted
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.percentReacted.subscribe((val) => {
        let liquidReactedElements = doc.getElementsByName('liquidReacted_' + this.lossIndex);
        liquidReactedElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //heatOfReaction
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.reactionHeat.subscribe((val) => {
        let heatOfReactionElements = doc.getElementsByName('heatOfReaction_' + this.lossIndex);
        heatOfReactionElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //endothermicOrExothermic
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.thermicReactionType.subscribe((val) => {
        let endothermicOrExothermicElements = doc.getElementsByName('endothermicOrExothermic_' + this.lossIndex);
        endothermicOrExothermicElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //additionalHeatRequired
      this.chargeMaterialCompareService.differentArray[this.lossIndex].different.liquidChargeMaterialDifferent.additionalHeat.subscribe((val) => {
        let additionalHeatRequiredElements = doc.getElementsByName('additionalHeatRequired_' + this.lossIndex);
        additionalHeatRequiredElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
    }
  }
}
