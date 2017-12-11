import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SettingsService } from '../../settings/settings.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ConvertPhastService } from '../convert-phast.service';
@Component({
  selector: 'app-system-basics',
  templateUrl: 'system-basics.component.html',
  styleUrls: ['system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  saveClicked: boolean;
  @Input()
  isAssessmentSettings: boolean;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();
  @Input()
  assessment: Assessment;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();


  @ViewChild('settingsModal') public settingsModal: ModalDirective;

  settingsForm: any;
  unitChange: boolean = false;

  isFirstChange: boolean = true;
  counter: any;
  newSettings: Settings;
  lossesExist: boolean;
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertPhastService: ConvertPhastService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    if (this.settingsForm.value.energyResultUnit == '' || !this.settingsForm.value.energyResultUnit) {
      this.settingsForm = this.settingsService.setEnergyResultUnit(this.settingsForm);
      this.saveChanges();
    }
    this.lossesExist = this.lossExists(this.phast);
  }

  ngOnDestroy() {
    clearTimeout(this.counter);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.saveClicked && !this.isFirstChange) {
      this.saveChanges();
    } else {
      this.isFirstChange = false;
    }
  }

  lossExists(phast: PHAST){
    if(phast.losses){
      return true;
    }else{
      return false;
    }
  }
  saveChanges() {
    this.newSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (this.settings.currency !== this.newSettings.currency || this.settings.unitsOfMeasure !== this.newSettings.unitsOfMeasure) {
      this.showSettingsModal();
    } else if (this.settings.energySourceType != this.newSettings.energySourceType ||
      this.settings.furnaceType != this.newSettings.furnaceType ||
      this.settings.energyResultUnit != this.newSettings.energyResultUnit) {
      this.updateData(false);
    }
  }

  updateData(bool?: boolean) {
    this.newSettings.assessmentId = this.assessment.id;
    if (bool) {
      if (this.phast.losses) {
        this.phast.losses = this.convertPhastService.convertPhastLosses(this.phast.losses, this.settings, this.newSettings);
        if (this.phast.meteredEnergy) {
          this.phast.meteredEnergy = this.convertPhastService.convertMeteredEnergy(this.phast.meteredEnergy, this.settings, this.newSettings);
        }
        if (this.phast.designedEnergy) {
          this.phast.designedEnergy = this.convertPhastService.convertDesignedEnergy(this.phast.designedEnergy, this.settings, this.newSettings);
        }
        if (this.phast.modifications) {
          this.phast.modifications.forEach(mod => {
            if (mod.phast.losses) {
              mod.phast.losses = this.convertPhastService.convertPhastLosses(mod.phast.losses, this.settings, this.newSettings);
            }
            if (mod.phast.meteredEnergy) {
              mod.phast.meteredEnergy = this.convertPhastService.convertMeteredEnergy(mod.phast.meteredEnergy, this.settings, this.newSettings);
            }
            if (mod.phast.designedEnergy) {
              mod.phast.designedEnergy = this.convertPhastService.convertDesignedEnergy(mod.phast.designedEnergy, this.settings, this.newSettings);
            }
          })
        }
      }
      this.save.emit(true);
    }
    //assessment has existing settings
    if (this.isAssessmentSettings) {
      this.newSettings.id = this.settings.id;
      this.indexedDbService.putSettings(this.newSettings).then(
        results => {
          //get updated settings
          this.updateSettings.emit(true);
          this.hideSettingsModal();
        }
      )
    }
    //create settings for assessment
    else {
      this.newSettings.createdDate = new Date();
      this.newSettings.modifiedDate = new Date();
      this.indexedDbService.addSettings(this.newSettings).then(
        results => {
          this.isAssessmentSettings = true;
          //get updated settings
          this.updateSettings.emit(true);
          this.hideSettingsModal();
        }
      )
    }
  }

  showSettingsModal() {
    this.settingsModal.show();
  }

  hideSettingsModal() {
    this.settingsModal.hide();
  }
  startSavePolling() {
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.saveChanges()
    }, 3500)
  }
}
