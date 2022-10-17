import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { FSAT, FsatInput, FsatOperations } from '../../shared/models/fans';
import { OperatingHours } from '../../shared/models/operations';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { FanOperationsWarnings, FsatWarningService } from '../fsat-warning.service';
import { FsatService } from '../fsat.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { OperationsService } from './operations.service';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { Subscription } from 'rxjs';

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
  co2SavingsFormDisabled: boolean;

  cO2SavingsData: Co2SavingsData;

  totalEmissionOutputRateDifferent: boolean = false;

  totalEmissionOutputRateDifferentSub: Subscription;

  warnings: FanOperationsWarnings;
  
  formWidth: number;
  
  showOperatingHoursModal: boolean = false;

  idString: string;

  operationsForm: UntypedFormGroup;

  constructor(private fsatWarningService: FsatWarningService, private assessmentCo2SavingsService: AssessmentCo2SavingsService, private compareService: CompareService, private operationsService: OperationsService, private helpPanelService: HelpPanelService, private fsatService: FsatService) { }

  ngOnInit() {
    this.totalEmissionOutputRateDifferentSub = this.compareService.totalEmissionOutputRateDifferent.subscribe(isDifferent => {
      this.totalEmissionOutputRateDifferent = isDifferent;
    })
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

  ngOnDestroy() {
    this.compareService.totalEmissionOutputRateDifferent.next(false);
    this.totalEmissionOutputRateDifferentSub.unsubscribe();
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
      this.setCo2SavingsData();
      this.save();
    }
  }

  disableForm() {
    this.operationsForm.controls.cost.disable();
    this.operationsForm.controls.operatingHours.disable();
    this.co2SavingsFormDisabled = true;
  }

  enableForm() {
    this.operationsForm.controls.cost.enable();
    this.operationsForm.controls.operatingHours.enable();
    this.co2SavingsFormDisabled = false;
  }

  save(){  
    this.fsatOperations = this.operationsService.getObjFromForm(this.operationsForm);
    this.fsatOperations.cO2SavingsData = this.cO2SavingsData;

    this.emitSave.emit(this.fsatOperations);
    this.checkForWarnings();
  }

  updateFsatCo2SavingsData(cO2SavingsData?: Co2SavingsData) {
    this.cO2SavingsData = cO2SavingsData;
    this.save();
    this.isTotalEmissionOutputRateDifferent();
  }

  setCo2SavingsData() {
    this.isTotalEmissionOutputRateDifferent();
    if (this.fsatOperations.cO2SavingsData) {
      this.cO2SavingsData = this.fsatOperations.cO2SavingsData;
    } else {
      let cO2SavingsData: Co2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsObject(this.settings);
      this.cO2SavingsData = cO2SavingsData;
    }
  }

  isTotalEmissionOutputRateDifferent() {
    if (this.canCompare()) {
      this.compareService.isTotalEmissionOutputRateDifferent();
    } else {
      this.compareService.totalEmissionOutputRateDifferent.next(false);
    }
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
