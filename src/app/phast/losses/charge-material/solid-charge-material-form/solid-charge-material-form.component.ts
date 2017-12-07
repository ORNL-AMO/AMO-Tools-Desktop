import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

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

  specificHeatError: string = null;
  latentHeatError: string = null;
  heatOfLiquidError: string = null;
  feedRateError: string = null;
  waterChargedError: string = null;
  waterDischargedError: string = null;
  chargeMeltedError: string = null;
  chargeSolidReactedError: string = null;
  heatOfReactionError: string = null;
  materialTypes: any;
  selectedMaterialId: any;
  selectedMaterial: any;
  counter: any;
  dischargeTempError: string = null;

  constructor(private suiteDbService: SuiteDbService, private chargeMaterialCompareService: ChargeMaterialCompareService, private windowRefService: WindowRefService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) {
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

  focusOut() {
    this.changeField.emit('default');
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.value.materialId);

    if (this.settings.unitsOfMeasure == 'Metric') {
      selectedMaterial.latentHeat = this.convertUnitsService.value(selectedMaterial.latentHeat).from('btuLb').to('kJkg');
      selectedMaterial.meltingPoint = this.convertUnitsService.value(selectedMaterial.meltingPoint).from('F').to('C');
      selectedMaterial.specificHeatLiquid = this.convertUnitsService.value(selectedMaterial.specificHeatLiquid).from('btulbF').to('kJkgC');
      selectedMaterial.specificHeatSolid = this.convertUnitsService.value(selectedMaterial.specificHeatSolid).from('btulbF').to('kJkgC');
    }

    this.chargeMaterialForm.patchValue({
      materialLatentHeatOfFusion: selectedMaterial.latentHeat,
      materialMeltingPoint: selectedMaterial.meltingPoint,
      materialHeatOfLiquid: selectedMaterial.specificHeatLiquid,
      materialSpecificHeatOfSolidMaterial: selectedMaterial.specificHeatSolid
    })
    this.calculate.emit(true);
  }
checkInputError(bool?: boolean) {
      if (!bool) {
    this.startSavePolling();
  }
  if (this.chargeMaterialForm.value.materialSpecificHeatOfSolidMaterial < 0) {
        this.specificHeatError = 'Average Specific Heat must be equal or greater than 0';
      } else {
        this.specificHeatError = null;
      }
  if (this.chargeMaterialForm.value.materialLatentHeatOfFusion < 0) {
        this.latentHeatError = 'Latent Heat of Fusion must be equal or greater than 0';
      } else {
        this.latentHeatError = null;
      }
  if (this.chargeMaterialForm.value.materialHeatOfLiquid < 0) {
        this.heatOfLiquidError = 'Specific heat of liquid from molten material must be equal or greater than 0';
      } else {
        this.heatOfLiquidError = null;
      }
  if (this.chargeMaterialForm.value.feedRate < 0) {
        this.feedRateError = 'Charge Feed Rate must be grater than 0';
      } else {
        this.feedRateError = null;
      }
  if (this.chargeMaterialForm.value.waterContentAsCharged < 0 || this.chargeMaterialForm.value.waterContentAsCharged > 100) {
        this.waterChargedError = 'Water Content as Charged must be equal or greater than 0 and less than or equal to 100%';
      } else {
        this.waterChargedError = null;
      }
  if (this.chargeMaterialForm.value.waterContentAsDischarged < 0 || this.chargeMaterialForm.value.waterContentAsDischarged > 100) {
        this.waterDischargedError = 'Water Content as Discharged must be equal or greater than 0 and less than or equal to 100%';
      } else {
        this.waterDischargedError = null;
      }
  if (this.chargeMaterialForm.value.percentChargeMelted < 0 || this.chargeMaterialForm.percentChargeMelted > 100) {
        this.chargeMeltedError = 'Charge Melted must be equal or greater than 0 and less than or equal to 100%';
      } else {
        this.chargeMeltedError = null;
      }
  if (this.chargeMaterialForm.value.percentChargeReacted < 0 || this.chargeMaterialForm.value.percentChargeReacted > 100) {
        this.chargeSolidReactedError = 'Charge Reacted must be equal or greater than 0 and less than or equal to 100%';
      } else {
        this.chargeSolidReactedError = null;
      }
   if (this.chargeMaterialForm.value.heatOfReaction < 0) {
        this.heatOfReactionError = 'Heat of Reaction cannot be less than zero. For exothermic reactions, change "Endothermic/Exothermic"';
      } else {
        this.heatOfReactionError = null;
      }
}

  emitSave() {
    this.saveEmit.emit(true);
  }

  startSavePolling() {
    this.calculate.emit(true);
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
