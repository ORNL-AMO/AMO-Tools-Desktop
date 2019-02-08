import { Component, OnInit, Input, ViewChild, SimpleChanges, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { FanFieldDataService } from './fan-field-data.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { ModalDirective } from 'ngx-bootstrap';
import { FieldData, InletPressureData, OutletPressureData, FSAT, PlaneData, FanRatedInfo, CompressibilityFactor, FsatOutput } from '../../shared/models/fans';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { FsatService } from '../fsat.service';
import { CompareService } from '../compare.service';
import { Subscription } from 'rxjs';
import { FanFieldDataWarnings, FsatWarningService } from '../fsat-warning.service';

@Component({
  selector: 'app-fan-field-data',
  templateUrl: './fan-field-data.component.html',
  styleUrls: ['./fan-field-data.component.css']
})
export class FanFieldDataComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  fieldData: FieldData;
  @Input()
  modificationIndex: number;
  @Input()
  loadEstimationMethod: string;
  @Input()
  baseline: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<FieldData>();
  @Input()
  fsat: FSAT;

  @ViewChild('modalBody') public modalBody: ElementRef;
  @ViewChild('amcaModal') public amcaModal: ModalDirective;
  @ViewChild('pressureModal') public pressureModal: ModalDirective;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getBodyHeight();
  }


  bodyHeight: number;
  loadEstimateMethods: Array<{ value: number, display: string }> = [
    { value: 0, display: 'Power' },
    { value: 1, display: 'Current' }
  ];

  warnings: FanFieldDataWarnings;
  fieldDataForm: FormGroup;
  pressureCalcType: string;
  pressureModalSub: Subscription;
  fsatCopy: FSAT;
  inletPressureCopy: InletPressureData;
  outletPressureCopy: OutletPressureData;
  idString: string;
  constructor(private compareService: CompareService, private fsatWarningService: FsatWarningService, private fanFieldDataService: FanFieldDataService, private convertUnitsService: ConvertUnitsService, private helpPanelService: HelpPanelService, private fsatService: FsatService) { }

  ngOnInit() {
    if (!this.baseline) {
      this.idString = 'fsat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'fsat_baseline';
    }
    this.init();
    if (!this.selected) {
      this.disableForm();
    }

    this.pressureModalSub = this.pressureModal.onShown.subscribe(() => {
      this.getBodyHeight();
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected) {
        this.enableForm();
      } else {
        this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.firstChange) {
      this.init();
    }
  }

  ngOnDestroy() {
    this.pressureModalSub.unsubscribe();
  }

  disableForm() {
    this.fieldDataForm.controls.loadEstimatedMethod.disable();
  }

  enableForm() {
    this.fieldDataForm.controls.loadEstimatedMethod.enable();
  }

  init() {
    if (this.fieldData) {
      if (!this.fieldData.cost) {
        this.fieldData.cost = this.settings.electricityCost;
      }
      this.fieldDataForm = this.fanFieldDataService.getFormFromObj(this.fieldData);
      // this.helpPanelService.currentField.next('operatingFraction');
      //init warning messages;
      this.checkForWarnings();
      //this.cd.detectChanges();
    }
  }

  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
  }

  getDisplayUnit(unit: any) {
    if (unit) {
      let dispUnit: string = this.convertUnitsService.getUnit(unit).unit.name.display;
      dispUnit = dispUnit.replace('(', '');
      dispUnit = dispUnit.replace(')', '');
      return dispUnit;
    }
  }


  showAmcaModal() {
    this.fsatCopy = JSON.parse(JSON.stringify(this.fsat));
    this.pressureCalcType = 'flow';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }

  save() {
    let tmpInletPressureData: InletPressureData = this.fieldData.inletPressureData;
    let tmpOutletPressureData: OutletPressureData = this.fieldData.outletPressureData;
    let tmpPlaneData: PlaneData = this.fieldData.planeData;
    let tmpfanRatedInfo: FanRatedInfo = this.fieldData.fanRatedInfo;
    let tmpCalcType: string = this.fieldData.pressureCalcResultType;
    this.fieldData = this.fanFieldDataService.getObjFromForm(this.fieldDataForm);
    this.fieldData.inletPressureData = tmpInletPressureData;
    this.fieldData.outletPressureData = tmpOutletPressureData;
    this.fieldData.planeData = tmpPlaneData;
    this.fieldData.fanRatedInfo = tmpfanRatedInfo;
    this.fieldData.pressureCalcResultType = tmpCalcType;
    this.emitSave.emit(this.fieldData);
    this.checkForWarnings();
  }

  checkForWarnings() {
    this.warnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat, this.settings, !this.baseline);
  }

  calculateCompressibility() {
    let tmpResults: FsatOutput = this.fsatService.getResults(this.fsat, true, this.settings);
    //todo
    let inputs: CompressibilityFactor = {
      moverShaftPower: tmpResults.motorShaftPower,
      inletPressure: this.fieldDataForm.controls.inletPressure.value,
      outletPressure: this.fieldDataForm.controls.outletPressure.value,
      barometricPressure: this.fsat.baseGasDensity.barometricPressure,
      flowRate: this.fieldDataForm.controls.flowRate.value,
      specificHeatRatio: this.fieldDataForm.controls.specificHeatRatio.value
    }
    let calcCompFactor: number = this.fsatService.compressibilityFactor(inputs, this.settings)
    this.fieldDataForm.patchValue({
      compressibilityFactor: Number(calcCompFactor.toFixed(3))
    });
  }

  showInletPressureModal() {
    if (this.fieldData.inletPressureData) {
      this.inletPressureCopy = JSON.parse(JSON.stringify(this.fieldData.inletPressureData));
    }
    this.pressureCalcType = 'inlet';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }

  showOutletPressureModal() {
    if (this.fieldData.outletPressureData) {
      this.outletPressureCopy = JSON.parse(JSON.stringify(this.fieldData.outletPressureData));
    }
    this.pressureCalcType = 'outlet';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }


  hidePressureModal() {
    this.pressureCalcType = undefined;
    this.fsatService.modalOpen.next(false);
    this.pressureModal.hide();
  }

  saveOutletPressure(outletPressureData: OutletPressureData) {
    this.fieldData.outletPressureData = outletPressureData;
    this.fieldDataForm.patchValue({
      outletPressure: this.fieldData.outletPressureData.calculatedOutletPressure
    });
    this.save();
  }

  saveOutletPressureCopy(outletPressureData: OutletPressureData) {
    this.outletPressureCopy = outletPressureData;
  }
  saveInletPressure(inletPressureData: InletPressureData) {
    this.fieldData.inletPressureData = inletPressureData;
    this.fieldDataForm.patchValue({
      inletPressure: this.fieldData.inletPressureData.calculatedInletPressure
    })
    this.save();
  }

  saveInletPressureCopy(inletPressureData: InletPressureData) {
    this.inletPressureCopy = inletPressureData;
  }

  saveFlowAndPressure(fsat: FSAT) {
    this.fieldData.inletPressure = fsat.fieldData.inletPressure;
    this.fieldData.outletPressure = fsat.fieldData.outletPressure;
    this.fieldData.flowRate = fsat.fieldData.flowRate;
    this.fieldData.fanRatedInfo = fsat.fieldData.fanRatedInfo;
    this.fieldData.planeData = fsat.fieldData.planeData;
    this.fieldDataForm.patchValue({
      inletPressure: this.fieldData.inletPressure,
      outletPressure: this.fieldData.outletPressure,
      flowRate: this.fieldData.flowRate
    })
    this.save();
  }

  saveFsatCopy(fsat: FSAT) {
    this.fsatCopy = fsat;
  }

  saveAndClose() {
    if (this.pressureCalcType == 'flow') {
      this.saveFlowAndPressure(this.fsatCopy);
    } else if (this.pressureCalcType == 'inlet') {
      this.saveInletPressure(this.inletPressureCopy);
    } else if (this.pressureCalcType == 'outlet') {
      this.saveOutletPressure(this.outletPressureCopy);
    }
    this.hidePressureModal();
  }

  getBodyHeight() {
    if (this.modalBody) {
      this.bodyHeight = this.modalBody.nativeElement.clientHeight;
    } else {
      this.bodyHeight = 0;
    }
  }

  canCompare() {
    if (this.compareService.baselineFSAT && this.compareService.modifiedFSAT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  isOperatingHoursDifferent() {
    if (this.canCompare()) {
      return this.compareService.isOperatingHoursDifferent();
    } else {
      return false;
    }
  }
  isCostDifferent() {
    if (this.canCompare()) {
      return this.compareService.isCostDifferent();
    } else {
      return false;
    }
  }
  isFlowRateDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFlowRateDifferent();
    } else {
      return false;
    }
  }
  isInletPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isInletPressureDifferent();
    } else {
      return false;
    }
  }
  isOutletPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isOutletPressureDifferent();
    } else {
      return false;
    }
  }
  // isLoadEstimatedMethodDifferent() {
  //   if (this.canCompare()) {
  //     return this.compareService.isLoadEstimatedMethodDifferent();
  //   } else {
  //     return false;
  //   }
  // }
  // isMotorPowerDifferent() {
  //   if (this.canCompare()) {
  //     return this.compareService.isMotorPowerDifferent();
  //   } else {
  //     return false;
  //   }
  // }
  isSpecificHeatRatioDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSpecificHeatRatioDifferent();
    } else {
      return false;
    }
  }
  isCompressibilityFactorDifferent() {
    if (this.canCompare()) {
      return this.compareService.isCompressibilityFactorDifferent();
    } else {
      return false;
    }
  }
  // isMeasuredVoltageDifferent() {
  //   if (this.canCompare()) {
  //     return this.compareService.isMeasuredVoltageDifferent();
  //   } else {
  //     return false;
  //   }
  // }
}
