import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FSAT, FsatOperations } from '../../shared/models/fans';
import { OperatingHours } from '../../shared/models/operations';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { FanOperationsWarnings, FsatWarningService } from '../fsat-warning.service';
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
  fsatOperations: FsatOperations;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<FsatOperations>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  baseline: boolean;
  @Input()
  modificationIndex: number;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  warnings: FanOperationsWarnings;
  
  formWidth: number;
  
  showOperatingHoursModal: boolean = false;

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


  init() {
    if (this.fsatOperations) {
      if (!this.fsatOperations.cost) {
        this.fsatOperations.cost = this.settings.electricityCost;
      }
      this.operationsForm = this.operationsService.getFormFromObj(this.fsatOperations);
      this.save();
    }
  }

  disableForm() {
    this.operationsForm.controls.cost.disable();
    this.operationsForm.controls.operatingHours.disable();
  }

  enableForm() {
    this.operationsForm.controls.cost.enable();
    this.operationsForm.controls.operatingHours.enable();
  }

  save(){  
    this.fsatOperations = this.operationsService.getObjFromForm(this.operationsForm);
    this.emitSave.emit(this.fsatOperations);
    this.checkForWarnings();
  }

  checkForWarnings() {
    this.warnings = this.fsatWarningService.checkOperationsWarnings(this.fsat, this.settings, !this.baseline);
  }

  focusField(inputName: string) {
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

}
