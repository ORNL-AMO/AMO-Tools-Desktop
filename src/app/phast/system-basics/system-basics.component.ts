import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SettingsService } from '../../settings/settings.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ModalDirective } from 'ngx-bootstrap';
import { ConvertPhastService } from '../convert-phast.service';
import { FormGroup } from '@angular/forms';
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
  @Output('openModal')
  openModal = new EventEmitter<boolean>();

  @ViewChild('settingsModal') public settingsModal: ModalDirective;

  settingsForm: FormGroup;
  unitChange: boolean = false;

  isFirstChange: boolean = true;
  counter: any;
  oldSettings: Settings;
  lossesExist: boolean;

  showUpdateData: boolean = false;
  dataUpdated: boolean = false;
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertPhastService: ConvertPhastService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    if (this.settingsForm.controls.energyResultUnit.value == '' || !this.settingsForm.controls.energyResultUnit.value) {
      this.settingsForm = this.settingsService.setEnergyResultUnit(this.settingsForm);
      this.saveChanges();
    }
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.lossesExist = this.lossExists(this.phast);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.saveClicked && !this.isFirstChange) {
      this.saveChanges();
    } else {
      this.isFirstChange = false;
    }
  }

  lossExists(phast: PHAST) {
    if (phast.losses) {
      return true;
    } else {
      return false;
    }
  }
  saveChanges() {
    let id = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;
    if (this.settings.unitsOfMeasure !== this.oldSettings.unitsOfMeasure) {
      if (this.phast.losses) {
        this.showUpdateData = true;
      }
      //this.showSettingsModal();
    }

    if (this.showUpdateData == false && this.phast.losses) {
      this.dataUpdated = true;
    }
    // } else if (this.settings.energySourceType != this.newSettings.energySourceType ||
    //   this.settings.furnaceType != this.newSettings.furnaceType ||
    //   this.settings.energyResultUnit != this.newSettings.energyResultUnit ||
    //   this.settings.customFurnaceName != this.newSettings.customFurnaceName) {
    //   this.updateData(false);
    // }
    if (this.isAssessmentSettings) {
      this.indexedDbService.putSettings(this.settings).then(
        results => {
          //get updated settings
          this.updateSettings.emit(true);
        }
      )
    }
    //create settings for assessment
    else {
      this.settings.createdDate = new Date();
      this.settings.modifiedDate = new Date();
      this.indexedDbService.addSettings(this.settings).then(
        results => {
          this.isAssessmentSettings = true;
          //get updated settings
          this.updateSettings.emit(true);
        }
      )
    }
  }

  updateData(bool?: boolean) {
    if (this.phast.losses) {
      this.phast.losses = this.convertPhastService.convertPhastLosses(this.phast.losses, this.oldSettings, this.settings);
      if (this.phast.meteredEnergy) {
        this.phast.meteredEnergy = this.convertPhastService.convertMeteredEnergy(this.phast.meteredEnergy, this.oldSettings, this.settings);
      }
      if (this.phast.designedEnergy) {
        this.phast.designedEnergy = this.convertPhastService.convertDesignedEnergy(this.phast.designedEnergy, this.oldSettings, this.settings);
      }
      if (this.phast.modifications) {
        this.phast.modifications.forEach(mod => {
          if (mod.phast.losses) {
            mod.phast.losses = this.convertPhastService.convertPhastLosses(mod.phast.losses, this.oldSettings, this.settings);
          }
          if (mod.phast.meteredEnergy) {
            mod.phast.meteredEnergy = this.convertPhastService.convertMeteredEnergy(mod.phast.meteredEnergy, this.oldSettings, this.settings);
          }
          if (mod.phast.designedEnergy) {
            mod.phast.designedEnergy = this.convertPhastService.convertDesignedEnergy(mod.phast.designedEnergy, this.oldSettings, this.settings);
          }
        })
      }
      this.save.emit(true);
      this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
      this.showUpdateData = false;
      this.dataUpdated = true;
    }
  }

  showSettingsModal() {
    this.openModal.emit(true);
    this.settingsModal.show();
  }

  hideSettingsModal() {
    this.openModal.emit(false);
    this.settingsModal.hide();
  }
  startSavePolling() {
    this.saveChanges()
  }
}
