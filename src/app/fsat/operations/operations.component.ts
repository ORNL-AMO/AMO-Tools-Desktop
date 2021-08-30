import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldData, FSAT } from '../../shared/models/fans';
import { OperatingHours } from '../../shared/models/operations';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { FanFieldDataWarnings, FsatWarningService } from '../fsat-warning.service';
import { FsatService } from '../fsat.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { OperationsService } from './operations.service';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  @Input()
  fsat: FSAT;  
  @Input()
  fieldData: FieldData;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<FieldData>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  baseline: boolean;
  @Input()
  modificationIndex: number;

  @ViewChild('modalBody', { static: false }) public modalBody: ElementRef;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
    this.getBodyHeight();
  }

  warnings: FanFieldDataWarnings;
  
  formWidth: number;
  
  bodyHeight: number;
  showOperatingHoursModal: boolean = false;
  userDefinedCompressibilityFactor: boolean = false;

  idString: string;

  operationsForm: FormGroup;

  constructor(private fsatWarningService: FsatWarningService, private compareService: CompareService, private operationsService: OperationsService, private helpPanelService: HelpPanelService, private fsatService: FsatService) { }

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
  }

  init() {
    if (this.fieldData) {
      if (!this.fieldData.cost) {
        this.fieldData.cost = this.settings.electricityCost;
      }
      this.operationsForm = this.operationsService.getFormFromObj(this.fieldData);
      this.save();
    }
  }

  disableForm() {
    this.operationsForm.controls.cost.disable();
  }

  enableForm() {
    this.operationsForm.controls.cost.enable();
  }

  save(){
    this.fieldData.operatingHours = this.operationsService.getHoursFromForm(this.operationsForm);
    this.fieldData.cost = this.operationsService.getCostFromForm(this.operationsForm);
    this.emitSave.emit(this.fieldData);
    this.checkForWarnings();
  }

  checkForWarnings() {
    this.warnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat, this.settings, !this.baseline);
  }

  focusField(inputName: string) {
    if (!this.baseline && inputName === 'measuredVoltage') {
      inputName = 'modMeasuredVoltage';
    }
    this.helpPanelService.currentField.next(inputName);
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

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.fsatService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.fsatService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.fsat.operatingHours = oppHours;
    this.operationsForm.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }


  getBodyHeight() {
    if (this.modalBody) {
      this.bodyHeight = this.modalBody.nativeElement.clientHeight;
    } else {
      this.bodyHeight = 0;
    }
  }
}
