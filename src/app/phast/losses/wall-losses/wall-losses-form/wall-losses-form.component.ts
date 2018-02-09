import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges, HostListener } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { WallLossCompareService } from '../wall-loss-compare.service';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { WallLossesSurface } from '../../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-wall-losses-form',
  templateUrl: './wall-losses-form.component.html',
  styleUrls: ['./wall-losses-form.component.css']
})
export class WallLossesFormComponent implements OnInit {
  @Input()
  wallLossesForm: FormGroup;
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
  @Output('inputError')
  inputError = new EventEmitter<boolean>();
  
  @ViewChild('materialModal') public materialModal: ModalDirective;

  windVelocityError: string = null;
  surfaceAreaError: string = null;
  firstChange: boolean = true;
  counter: any;
  surfaceTmpError: string = null;
  emissivityError: string = null;
  surfaceEmissivityError: string = null;
  surfaceOptions: Array<WallLossesSurface>;
  showModal: boolean = false;
  constructor(private windowRefService: WindowRefService, private wallLossCompareService: WallLossCompareService, private suiteDbService: SuiteDbService, private lossesService: LossesService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
    //init warnings
    this.checkInputError(true);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      //on changes to baseline selected enable/disable form
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
    //wait for view to init to disable form
    if (!this.baselineSelected) {
      this.disableForm();
    }
    //initialize difference monitor
    this.initDifferenceMonitor();
  }

  //iterate through form elements and disable
  disableForm() {
    this.wallLossesForm.disable();
  }
  //iterate through form elements and enable
  enableForm() {
    this.wallLossesForm.enable();
  }
  //checkSurfaceTemp and ambientTemp for needed warnings
  // checkSurfaceTemp(bool?: boolean) {
  //   //bool = true on call from ngOnInit to skip save line
  //   if (!bool) {
  //     this.startSavePolling();
  //   }
  //   if (this.wallLossesForm.controls.avgSurfaceTemp.value < this.wallLossesForm.controls.ambientTemp.value) {
  //     this.surfaceTmpError = 'Surface temperature lower is than ambient temperature';
  //   } else {
  //     this.surfaceTmpError = null;
  //   }
  // }
  //same as above for emissivity
  // checkEmissivity(bool?: boolean) {
  //   if (!bool) {
  //     this.startSavePolling();
  //   }
  //   if (this.wallLossesForm.controls.surfaceEmissivity.value > 1 || this.wallLossesForm.controls.surfaceEmissivity.value < 0) {
  //     this.emissivityError = 'Surface emissivity must be between 0 and 1';
  //   } else {
  //     this.emissivityError = null;
  //   }
  // }

  //emits to wall-losses.component the focused field changed
  focusField(str: string) {
    this.changeField.emit(str);
  }
  //emits to default help on blur of input elements
  focusOut() {
    this.changeField.emit('default');
  }

  //emit to wall-losses.component to begin saving process
  emitSave() {
    this.saveEmit.emit(true);
  }

  checkInputError(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.wallLossesForm.controls.windVelocity.value < 0) {
      this.windVelocityError = 'Wind Velocity must be equal or greater than 0';
    } else {
      this.windVelocityError = null;
    }
    if (this.wallLossesForm.controls.surfaceArea.value < 0) {
      this.surfaceAreaError = 'Total Outside Surface Area must be equal or greater than 0';
    } else {
      this.surfaceAreaError = null;
    }

    if (this.wallLossesForm.controls.avgSurfaceTemp.value < this.wallLossesForm.controls.ambientTemp.value) {
      this.surfaceTmpError = 'Surface temperature lower is than ambient temperature';
    } else {
      this.surfaceTmpError = null;
    }
    if (this.wallLossesForm.controls.surfaceEmissivity.value > 1 || this.wallLossesForm.controls.surfaceEmissivity.value < 0) {
      this.emissivityError = 'Surface emissivity must be between 0 and 1';
    } else {
      this.emissivityError = null;
    }

    if(this.windVelocityError || this.surfaceAreaError || this.surfaceTmpError || this.emissivityError){
      this.inputError.emit(true);
    }else {
      this.inputError.emit(false);
    }
  }

  //on input/change in form startSavePolling is called, if not called again with 3 seconds save process is triggered
  startSavePolling() {
    this.calculate.emit(true);
    this.emitSave();
  }

  //method used to subscribe to service monitoring differences in baseline vs modification forms
  initDifferenceMonitor() {
    if (this.wallLossCompareService.baselineWallLosses && this.wallLossCompareService.modifiedWallLosses && this.wallLossCompareService.differentArray.length != 0) {
      if (this.wallLossCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();
        //avgSurfaceTemp
        this.wallLossCompareService.differentArray[this.lossIndex].different.surfaceTemperature.subscribe((val) => {
          let avgSurfaceTempElements = doc.getElementsByName('avgSurfaceTemp_' + this.lossIndex);
          avgSurfaceTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //ambientTemp
        this.wallLossCompareService.differentArray[this.lossIndex].different.ambientTemperature.subscribe((val) => {
          let ambientTempElements = doc.getElementsByName('ambientTemp_' + this.lossIndex);
          ambientTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //windVelocity
        this.wallLossCompareService.differentArray[this.lossIndex].different.windVelocity.subscribe((val) => {
          let windVelocityElements = doc.getElementsByName('windVelocity_' + this.lossIndex);
          windVelocityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //surfaceShape
        this.wallLossCompareService.differentArray[this.lossIndex].different.surfaceShape.subscribe((val) => {
          let surfaceShapeElements = doc.getElementsByName('surfaceShape_' + this.lossIndex);
          surfaceShapeElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        // //conditionFactor
        // this.wallLossCompareService.differentArray[this.lossIndex].different.conditionFactor.subscribe((val) => {
        //   let conditionFactorElements = doc.getElementsByName('conditionFactor_' + this.lossIndex);
        //   conditionFactorElements.forEach(element => {
        //     element.classList.toggle('indicate-different', val);
        //   });
        // })
        //surfaceEmissivity
        this.wallLossCompareService.differentArray[this.lossIndex].different.surfaceEmissivity.subscribe((val) => {
          let surfaceEmissivityElements = doc.getElementsByName('surfaceEmissivity_' + this.lossIndex);
          surfaceEmissivityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //surfaceArea
        this.wallLossCompareService.differentArray[this.lossIndex].different.surfaceArea.subscribe((val) => {
          let surfaceAreaElements = doc.getElementsByName('surfaceArea_' + this.lossIndex);
          surfaceAreaElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //correctionFactor
        this.wallLossCompareService.differentArray[this.lossIndex].different.correctionFactor.subscribe((val) => {
          let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
          correctionFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }

  setProperties() {
    let tmpFactor = this.suiteDbService.selectWallLossesSurfaceById(this.wallLossesForm.controls.surfaceShape.value);
    this.wallLossesForm.patchValue({
      conditionFactor: this.roundVal(tmpFactor.conditionFactor, 4)
    })
    this.calculate.emit(true);
  }
  roundVal(val: number, digits: number) {
    let test = Number(val.toFixed(digits));
    return test;
  }

  showMaterialModal() {
    this.showModal = true;
    this.lossesService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.surfaceOptions = this.suiteDbService.selectWallLossesSurface();
      let newMaterial = this.surfaceOptions.filter(material => { return material.surface == event.surface })
      if (newMaterial.length != 0) {
        this.wallLossesForm.patchValue({
          surfaceShape: newMaterial[0].id
        })
        this.setProperties();
      }
    }
    this.materialModal.hide();
    this.showModal = false;
    this.lossesService.modalOpen.next(this.showModal);
  }
}
