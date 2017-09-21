import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { FixtureLossesCompareService } from "../fixture-losses-compare.service";
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-fixture-losses-form',
  templateUrl: './fixture-losses-form.component.html',
  styleUrls: ['./fixture-losses-form.component.css']
})
export class FixtureLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
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
  counter: any;
  materials: Array<any>;
  constructor(private windowRefService: WindowRefService, private fixtureLossesCompareService: FixtureLossesCompareService, private suiteDbService: SuiteDbService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) { }

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
    this.materials = this.suiteDbService.selectSolidLoadChargeMaterials();
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

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitSave() {
    this.saveEmit.emit(true);
  }

  setSpecificHeat() {
    let tmpMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.lossesForm.value.materialName);
    this.lossesForm.patchValue({
      specificHeat: tmpMaterial.specificHeatSolid
    })
    this.startSavePolling();
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
    if (this.fixtureLossesCompareService.baselineFixtureLosses && this.fixtureLossesCompareService.modifiedFixtureLosses && this.fixtureLossesCompareService.differentArray.length != 0) {
      if (this.fixtureLossesCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();
        //materialName
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.materialName.subscribe((val) => {
          let materialNameElements = doc.getElementsByName('materialName_' + this.lossIndex);
          materialNameElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //specificHeat
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.specificHeat.subscribe((val) => {
          let specificHeatElements = doc.getElementsByName('specificHeat_' + this.lossIndex);
          specificHeatElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //feedRate
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.feedRate.subscribe((val) => {
          let feedRateElements = doc.getElementsByName('feedRate_' + this.lossIndex);
          feedRateElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //initialTemp
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.initialTemperature.subscribe((val) => {
          let initialTempElements = doc.getElementsByName('initialTemp_' + this.lossIndex);
          initialTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //finalTemp
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.finalTemperature.subscribe((val) => {
          let finalTempElements = doc.getElementsByName('finalTemp_' + this.lossIndex);
          finalTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //correctionFactor
        this.fixtureLossesCompareService.differentArray[this.lossIndex].different.correctionFactor.subscribe((val) => {
          let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
          correctionFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.lossesForm.value.materialName);
        if (this.settings.unitsOfMeasure == 'Metric') {
      selectedMaterial.specificHeatSolid = this.convertUnitsService.value(selectedMaterial.specificHeatSolid).from('btulbF').to('kJkgC');
    }
    
    this.lossesForm.patchValue({
      specificHeat: selectedMaterial.specificHeatSolid
    })
    this.calculate.emit(true);
  }

  showMaterialModal() {
    this.lossesService.modalOpen.next(true);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.materials = this.suiteDbService.selectSolidLoadChargeMaterials();
      let newMaterial = this.materials.filter(material => { return material.substance == event.substance })
      if (newMaterial.length != 0) {
        this.lossesForm.patchValue({
          materialName: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.lossesService.modalOpen.next(false);
  }
}
