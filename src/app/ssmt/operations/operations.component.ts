import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { SSMT, GeneralSteamOperations } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OperationsService } from './operations.service';
import { OperatingHours, OperatingCosts } from '../../shared/models/operations';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<SSMT>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  modificationIndex: number;

  idString: string = 'baseline_';

  operationsForm: FormGroup;

  constructor(private operationsService: OperationsService) { }

  ngOnInit() {
    this.initForm();
    if (!this.isBaseline) {
      this.idString = 'modification_';
    }
    if (this.selected === false) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected === true) {
        this.enableForm();
      } else if (this.selected === false) {
        this.disableForm();
      }
    }
    if(changes.modificationIndex && !changes.modificationIndex.isFirstChange()){
      this.initForm();
    }
  }

  initForm(){
    this.operationsForm = this.operationsService.getForm(this.ssmt, this.settings);
  }

  disableForm() {
    this.operationsForm.disable();
  }

  enableForm() {
    this.operationsForm.enable();
  }

  save() {
    // Reset validators to check values on every form change
    this.operationsForm = this.operationsService.setMakeUpTempValidators(this.operationsForm, this.ssmt)
    let newData: {
      operatingHours: OperatingHours, operatingCosts: OperatingCosts, generalSteamOperations: GeneralSteamOperations
    } = this.operationsService.getOperationsDataFromForm(this.operationsForm);
    this.ssmt.operatingCosts = newData.operatingCosts;
    this.ssmt.operatingHours.hoursPerYear = newData.operatingHours.hoursPerYear;
    this.ssmt.generalSteamOperations = newData.generalSteamOperations;
    this.emitSave.emit(this.ssmt);
  }
}
