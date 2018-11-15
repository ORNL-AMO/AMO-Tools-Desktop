import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FSAT } from '../../../shared/models/fans';
import { HelpPanelService } from '../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../modify-conditions/modify-conditions.service';
import { FormGroup } from '@angular/forms';
import { FanFieldDataService } from '../../fan-field-data/fan-field-data.service';
import { FanMotorService } from '../../fan-motor/fan-motor.service';
import { FanSetupService } from '../../fan-setup/fan-setup.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FsatService } from '../../fsat.service';
import { FanFieldDataWarnings, FsatWarningService } from '../../fsat-warning.service';

@Component({
  selector: 'app-explore-opportunities-form',
  templateUrl: './explore-opportunities-form.component.html',
  styleUrls: ['./explore-opportunities-form.component.css']
})
export class ExploreOpportunitiesFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  exploreModIndex: number;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('emitAddNewMod')
  emitAddNewMod = new EventEmitter<boolean>();

  showSizeMargin: boolean;

  baselineFieldDataForm: FormGroup;
  modificationFieldDataForm: FormGroup;

  baselineMotorForm: FormGroup;
  modificationMotorForm: FormGroup;

  baselineFanSetupForm: FormGroup;
  modificationFanSetupForm: FormGroup;
  baselineFanEfficiency: number;

  modificationFanFieldDataWarnings: FanFieldDataWarnings;
  baselineFanFieldDataWarnings: FanFieldDataWarnings;


  constructor(private helpPanelService: HelpPanelService, private modifyConditionsService: ModifyConditionsService, private fanFieldDataService: FanFieldDataService,
    private fanMotorService: FanMotorService, private fanSetupService: FanSetupService, private convertUnitsService: ConvertUnitsService, private fsatService: FsatService,
    private fsatWarningService: FsatWarningService) { }

  ngOnInit() {
    this.initForms();
    this.checkWarnings();
  }

  calculate() {
    this.save();
    this.emitCalculate.emit(true);
  }

  save() {
    this.fsat.modifications[this.exploreModIndex].fsat.fieldData = this.fanFieldDataService.getObjFromForm(this.modificationFieldDataForm);
    this.fsat.modifications[this.exploreModIndex].fsat.fanMotor = this.fanMotorService.getObjFromForm(this.modificationMotorForm);
    this.fsat.modifications[this.exploreModIndex].fsat.fanSetup = this.fanSetupService.getObjFromForm(this.modificationFanSetupForm);
    this.checkWarnings();
    this.emitSave.emit(true);
  }

  initForms() {
    this.baselineFieldDataForm = this.fanFieldDataService.getFormFromObj(this.fsat.fieldData);
    this.baselineFieldDataForm.disable();
    this.modificationFieldDataForm = this.fanFieldDataService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fieldData);

    this.baselineMotorForm = this.fanMotorService.getFormFromObj(this.fsat.fanMotor);
    this.baselineMotorForm.disable();
    this.modificationMotorForm = this.fanMotorService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fanMotor);


    this.baselineFanSetupForm = this.fanSetupService.getFormFromObj(this.fsat.fanSetup, false);
    this.baselineFanSetupForm.disable();
    this.modificationFanSetupForm = this.fanSetupService.getFormFromObj(this.fsat.modifications[this.exploreModIndex].fsat.fanSetup, true);
    
    this.baselineFanEfficiency = this.fsatService.getResults(this.fsat, true, this.settings).fanEfficiency;
    this.baselineFanEfficiency = this.convertUnitsService.roundVal(this.baselineFanEfficiency, 2);
  }

  checkWarnings() {
    this.baselineFanFieldDataWarnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat, this.settings);
    this.modificationFanFieldDataWarnings = this.fsatWarningService.checkFieldDataWarnings(this.fsat.modifications[this.exploreModIndex].fsat, this.settings);
  }


  focusField(str: string) {
    this.helpPanelService.currentField.next(str);
    this.modifyConditionsService.modifyConditionsTab.next('fan-field-data')
  }

  addNewMod() {
    this.emitAddNewMod.emit(true);
  }
}
