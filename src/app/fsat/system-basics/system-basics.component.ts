import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SettingsService } from '../../settings/settings.service';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { ConvertFsatService } from '../convert-fsat.service';
import { FSAT } from '../../shared/models/fans';

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Output('emitSave')
  emitSave = new EventEmitter<Settings>();
  @Output('emitSaveFsat')
  emitSaveFsat = new EventEmitter<FSAT>();

  settingsForm: FormGroup; 
  oldSettings: Settings;
  showUpdateData: boolean = false;
  dataUpdated: boolean = false;
  constructor(private settingsService: SettingsService, private convertFsatService: ConvertFsatService) { }


  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
  }


  save(){
    let id: number = this.settings.id;
    let createdDate = this.settings.createdDate;
    let assessmentId: number = this.settings.assessmentId;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.createdDate = createdDate;
    this.settings.assessmentId = assessmentId;
    if (
      this.settings.temperatureMeasurement != this.oldSettings.temperatureMeasurement ||
      this.settings.densityMeasurement != this.oldSettings.densityMeasurement ||
      this.settings.fanBarometricPressure != this.oldSettings.fanBarometricPressure ||
      this.settings.fanPressureMeasurement != this.oldSettings.fanPressureMeasurement ||
      this.settings.fanFlowRate != this.oldSettings.fanFlowRate
    ){
      this.showUpdateData = true;
    }
    if(this.dataUpdated == true){
      this.dataUpdated = false;
    }
    this.emitSave.emit(this.settings);
  }

  updateData(){
    this.assessment.fsat = this.convertFsatService.convertAllInputData(this.assessment.fsat, this.oldSettings, this.settings);
    this.emitSaveFsat.emit(this.assessment.fsat);
    this.dataUpdated = true;
    this.showUpdateData = false;
  }
}
