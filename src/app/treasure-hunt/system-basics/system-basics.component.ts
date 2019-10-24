import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FormGroup } from '@angular/forms';
import { SettingsService } from '../../settings/settings.service';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { OperatingHours } from '../../shared/models/operations';
import { TreasureHuntService } from '../treasure-hunt.service';
import { ConvertInputDataService } from '../convert-input-data.service';

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
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean = false;

  settingsForm: FormGroup;
  oldSettings: Settings;
  showUpdateData: boolean = false;
  dataUpdated: boolean = false;
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService,
    private settingsDbService: SettingsDbService, private treasureHuntService: TreasureHuntService, private convertInputDataService: ConvertInputDataService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100);
  }

  saveSettings() {
    let id: number = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;
    if (this.settings.unitsOfMeasure != this.oldSettings.unitsOfMeasure) {
      this.showUpdateData = true;
      if (this.dataUpdated === true) {
        this.dataUpdated = false;
      }
    } else {
      this.showUpdateData = false;
    }

    this.indexedDbService.putSettings(this.settings).then(
      results => {
        this.settingsDbService.setAll().then(() => {
          //get updated settings
          this.updateSettings.emit(true);
        })
      }
    )
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


  updateData() {
    console.log('convert before');
    this.assessment.treasureHunt = this.convertInputDataService.convertTreasureHuntInputData(this.assessment.treasureHunt, this.oldSettings, this.settings);
    this.settings = this.convertInputDataService.convertSettingsUnitCosts(this.oldSettings, this.settings);
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    console.log('converted');
    this.saveSettings();
    this.saveTreasureHunt();
    this.dataUpdated = true;
    this.showUpdateData = false;
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
  }
}
