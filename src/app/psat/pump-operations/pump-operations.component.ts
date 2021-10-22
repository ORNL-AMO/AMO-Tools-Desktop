import { Component, OnInit, Output, EventEmitter, ViewChild, Input, SimpleChanges, ElementRef, HostListener } from '@angular/core';
import { PSAT } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { FormGroup } from '@angular/forms';
import { Assessment } from '../../shared/models/assessment';
import { PsatWarningService, OperationsWarnings } from '../psat-warning.service';
import { PsatService } from '../psat.service';
import { OperatingHours } from '../../shared/models/operations';
import { PumpOperationsService } from './pump-operations.service';

@Component({
  selector: 'app-pump-operations',
  templateUrl: './pump-operations.component.html',
  styleUrls: ['./pump-operations.component.css']
})
export class PumpOperationsComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  baseline: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  modificationIndex: number;

 
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean = false;

  psatForm: FormGroup;
  operationsWarnings: OperationsWarnings;
  idString: string;

  constructor(private psatService: PsatService, private psatWarningService: PsatWarningService, private compareService: CompareService, private helpPanelService: HelpPanelService, private pumpOperationsService: PumpOperationsService) { }

  ngOnInit() {
    if (!this.baseline) {
      this.idString = 'psat_modification_' + this.modificationIndex;
    }
    else {
      this.idString = 'psat_baseline';
    }
    this.init();
    if (!this.selected) {
      this.disableForm();
    }

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange()) {
      this.init();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  init() {
    this.psatForm = this.pumpOperationsService.getFormFromObj(this.psat.inputs, this.baseline, this.psat.inputs.whatIfScenario);
    this.helpPanelService.currentField.next('operatingHours');
    this.checkWarnings();
  }

  disableForm() {
    this.psatForm.controls.operatingHours.disable();
  }

  enableForm() {
    this.psatForm.controls.operatingHours.enable();
  }

  focusField(inputName: string) {
    this.helpPanelService.currentField.next(inputName);
  }

  save() {
    this.psat.inputs = this.pumpOperationsService.getPsatInputsFromForm(this.psatForm, this.psat.inputs);
    this.checkWarnings();
    this.saved.emit(true);
  }

  checkWarnings() {
    this.operationsWarnings = this.psatWarningService.checkPumpOperations(this.psat, this.settings, this.baseline);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.psatService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.psatService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.psat.operatingHours = oppHours;
    this.psatForm.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  canCompare() {
    if (this.compareService.baselinePSAT && this.compareService.modifiedPSAT && !this.inSetup) {
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
  isCostKwhrDifferent() {
    if (this.canCompare()) {
      return this.compareService.isCostKwhrDifferent();
    } else {
      return false;
    }
  }

}
