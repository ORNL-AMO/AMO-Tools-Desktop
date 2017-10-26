import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ChargeMaterialCompareService } from '../charge-material-compare.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
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
  selectedMaterial: any;
  counter: any;
  showModal: boolean = false;
  constructor(private suiteDbService: SuiteDbService, private chargeMaterialCompareService: ChargeMaterialCompareService, private windowRefService: WindowRefService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) { }

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

  focusField(str: string) {
    this.changeField.emit(str);
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectGasLoadChargeMaterialById(this.chargeMaterialForm.value.materialId);
        if (this.settings.unitsOfMeasure == 'Metric') {
      selectedMaterial.specificHeatVapor = this.convertUnitsService.value(selectedMaterial.specificHeatVapor).from('btulbF').to('kJkgC');
    }
    this.chargeMaterialForm.patchValue({
      materialSpecificHeat: selectedMaterial.specificHeatVapor,
    });
    this.calculate.emit(true);
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

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materialTypes = this.suiteDbService.selectGasLoadChargeMaterials();
      let newMaterial = this.materialTypes.filter(material => { return material.substance == event.substance })
      if (newMaterial.length != 0) {
        this.chargeMaterialForm.patchValue({
          materialId: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
    this.calculate.emit(true);
  }
}
