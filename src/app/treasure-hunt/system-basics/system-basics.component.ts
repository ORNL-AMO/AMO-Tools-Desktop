import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FormGroup } from '@angular/forms';
import { SettingsService } from '../../settings/settings.service';
 
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { OperatingHours } from '../../shared/models/operations';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ConvertInputDataService } from '../convert-input-data.service';
import * as _ from 'lodash';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit, OnDestroy {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();
  @Output('openUpdateUnitsModal') 
  openUpdateUnitsModal = new EventEmitter<Settings>();

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  
  formWidth: number;
  showOperatingHoursModal: boolean = false;
  
  settingsForm: FormGroup;
  oldSettings: Settings;
  showUpdateDataReminder: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private settingsService: SettingsService,   
    private settingsDbService: SettingsDbService, private treasureHuntService: TreasureHuntService, private convertInputDataService: ConvertInputDataService,
    private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (this.assessment.treasureHunt.existingDataUnits && this.assessment.treasureHunt.existingDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings = this.getExistingDataSettings();
      this.showUpdateDataReminder = true;
    }
  }

  ngOnDestroy() {
    if(this.showUpdateDataReminder && this.oldSettings) {
      this.openUpdateUnitsModal.emit(this.oldSettings);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100);
  }

  async saveSettings() {
    let id: number = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;
    if (this.settings.unitsOfMeasure != this.oldSettings.unitsOfMeasure) {
      this.assessment.treasureHunt.existingDataUnits = this.oldSettings.unitsOfMeasure;
      this.saveTreasureHunt();
      this.showUpdateDataReminder = true;
    }

    if (this.showSuccessMessage === true) {
      this.showSuccessMessage = false;
    }

    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.updateWithObservable(this.settings))
    this.settingsDbService.setAll(updatedSettings);
    this.updateSettings.emit(true);
  }

  saveTreasureHunt() {
    this.treasureHuntService.treasureHunt.next(this.assessment.treasureHunt);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.treasureHuntService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.treasureHuntService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.assessment.treasureHunt.operatingHours = oppHours;
    this.saveTreasureHunt();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  getExistingDataSettings(): Settings {
    let existingSettingsForm: FormGroup = _.cloneDeep(this.settingsForm);
    existingSettingsForm.patchValue({unitsOfMeasure: this.assessment.treasureHunt.existingDataUnits});
    let existingSettings = this.settingsService.setUnits(existingSettingsForm);
    return this.settingsService.getSettingsFromForm(existingSettings);
  }

  updateData(showSuccess?: boolean) {
    this.assessment.treasureHunt = this.convertInputDataService.convertTreasureHuntInputData(this.assessment.treasureHunt, this.oldSettings, this.settings);
    this.settings = this.convertUnitsService.convertSettingsUnitCosts(this.oldSettings, this.settings);
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.saveSettings();    
    if(showSuccess) {
      this.initSuccessMessage();
    }
    this.assessment.treasureHunt.existingDataUnits = this.settings.unitsOfMeasure;
    this.saveTreasureHunt();
    this.showUpdateDataReminder = false;
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
  }

  initSuccessMessage() {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }
  
  dismissSuccessMessage() {
    this.showSuccessMessage = false;
  }
}
