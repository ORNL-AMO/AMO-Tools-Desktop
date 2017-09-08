import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-solid-charge-material-form',
  templateUrl: './solid-charge-material-form.component.html',
  styleUrls: ['./solid-charge-material-form.component.css']
})
export class SolidChargeMaterialFormComponent implements OnInit {
  @Input()
  chargeMaterialForm: any;
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

  materialTypes: any;
  selectedMaterialId: any;
  selectedMaterial: any;
  counter: any;
  dischargeTempError: string = null;
  constructor(private suiteDbService: SuiteDbService, private chargeMaterialCompareService: ChargeMaterialCompareService, private windowRefService: WindowRefService, private lossesService: LossesService) { }

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
    //get material types from ToolSuiteDb
    this.materialTypes = this.suiteDbService.selectSolidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.value.materialId && this.chargeMaterialForm.value.materialId != '') {
        if (this.chargeMaterialForm.value.materialLatentHeatOfFusion == '') {
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
  ngOnDestroy() {
    this.lossesService.modalOpen.next(false);
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
    if (this.chargeMaterialForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }

  checkDischargeTemp() {
    if ((this.chargeMaterialForm.value.chargeMaterialDischargeTemperature > this.chargeMaterialForm.value.materialMeltingPoint) && this.chargeMaterialForm.value.percentChargeMelted == 0) {
      this.dischargeTempError = 'The discharge temperature is higher than the melting point, please enter proper percentage for charge melted.';
      return false;
    } else if ((this.chargeMaterialForm.value.chargeMaterialDischargeTemperature < this.chargeMaterialForm.value.materialMeltingPoint) && this.chargeMaterialForm.value.percentChargeMelted > 0) {
      this.dischargeTempError = 'The discharge temperature is lower than the melting point, the percentage for charge melted should be 0%.';
      return false;
    } else {
      this.dischargeTempError = null;
      return true;
    }
  }


  focusField(str: string) {
    this.changeField.emit(str);
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.value.materialId);
    this.chargeMaterialForm.patchValue({
      materialLatentHeatOfFusion: selectedMaterial.latentHeat,
      materialMeltingPoint: selectedMaterial.meltingPoint,
      materialHeatOfLiquid: selectedMaterial.specificHeatLiquid,
      materialSpecificHeatOfSolidMaterial: selectedMaterial.specificHeatSolid
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
      if (this.chargeMaterialCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //materialName
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.materialId.subscribe((val) => {
          let materialNameElements = doc.getElementsByName('materialName_' + this.lossIndex);
          materialNameElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //materialSpecificHeatOfSolidMaterial
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.specificHeatSolid.subscribe((val) => {
          let materialSpecificHeatOfSolidMaterialElements = doc.getElementsByName('materialSpecificHeatOfSolidMaterial_' + this.lossIndex);
          materialSpecificHeatOfSolidMaterialElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //materialLatentHeatOfFusion
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.latentHeat.subscribe((val) => {
          let materialLatentHeatOfFusionElements = doc.getElementsByName('materialLatentHeatOfFusion_' + this.lossIndex);
          materialLatentHeatOfFusionElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //materialHeatOfLiquid
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.specificHeatLiquid.subscribe((val) => {
          let materialHeatOfLiquidElements = doc.getElementsByName('materialHeatOfLiquid_' + this.lossIndex);
          materialHeatOfLiquidElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //materialMeltingPoint
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.meltingPoint.subscribe((val) => {
          let materialMeltingPointElements = doc.getElementsByName('materialMeltingPoint_' + this.lossIndex);
          materialMeltingPointElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //feedRate
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.chargeFeedRate.subscribe((val) => {
          let feedRateElements = doc.getElementsByName('feedRate_' + this.lossIndex);
          feedRateElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //waterContentAsCharged
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.waterContentCharged.subscribe((val) => {
          let waterContentAsChargedElements = doc.getElementsByName('waterContentAsCharged_' + this.lossIndex);
          waterContentAsChargedElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //waterContentAsDischarged
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.waterContentDischarged.subscribe((val) => {
          let waterContentAsDischargedElements = doc.getElementsByName('waterContentAsDischarged_' + this.lossIndex);
          waterContentAsDischargedElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //initialTemperature
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.initialTemperature.subscribe((val) => {
          let initialTemperatureElements = doc.getElementsByName('initialTemperature_' + this.lossIndex);
          initialTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //chargeMaterialDischargeTemperature
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.dischargeTemperature.subscribe((val) => {
          let chargeMaterialDischargeTemperatureElements = doc.getElementsByName('chargeMaterialDischargeTemperature_' + this.lossIndex);
          chargeMaterialDischargeTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //waterVaporDischargeTemperature
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.waterVaporDischargeTemperature.subscribe((val) => {
          let waterVaporDischargeTemperatureElements = doc.getElementsByName('waterVaporDischargeTemperature_' + this.lossIndex);
          waterVaporDischargeTemperatureElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //percentChargeMelted
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.chargeMelted.subscribe((val) => {
          let percentChargeMeltedElements = doc.getElementsByName('percentChargeMelted_' + this.lossIndex);
          percentChargeMeltedElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //percentChargeReacted
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.chargeReacted.subscribe((val) => {
          let percentChargeReactedElements = doc.getElementsByName('percentChargeReacted_' + this.lossIndex);
          percentChargeReactedElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //heatOfReaction
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.reactionHeat.subscribe((val) => {
          let heatOfReactionElements = doc.getElementsByName('heatOfReaction_' + this.lossIndex);
          heatOfReactionElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //endothermicOrExothermic
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.thermicReactionType.subscribe((val) => {
          let endothermicOrExothermicElements = doc.getElementsByName('endothermicOrExothermic_' + this.lossIndex);
          endothermicOrExothermicElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //additionalHeatRequired
        this.chargeMaterialCompareService.differentArray[this.lossIndex].different.solidChargeMaterialDifferent.additionalHeat.subscribe((val) => {
          let additionalHeatRequiredElements = doc.getElementsByName('additionalHeatRequired_' + this.lossIndex);
          additionalHeatRequiredElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }

  showMaterialModal() {
    this.lossesService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.suiteDbService.selectSolidLoadChargeMaterials();
      let newMaterial = this.materialTypes.filter(material => { return material.substance == event.substance })
      if (newMaterial.length != 0) {
        this.chargeMaterialForm.patchValue({
          materialId: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.lossesService.modalOpen.next(false);
  }
}
