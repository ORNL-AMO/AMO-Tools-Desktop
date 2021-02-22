import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { SettingsService } from '../../settings/settings.service';
import { PHAST } from '../../shared/models/phast/phast';
import { Settings } from '../../shared/models/settings';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ConvertPhastService } from '../convert-phast.service';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { ModalDirective } from 'ngx-bootstrap';
@Component({
  selector: 'app-system-basics',
  templateUrl: 'system-basics.component.html',
  styleUrls: ['system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('updateSettings')
  updateSettings = new EventEmitter<boolean>();
  @Input()
  assessment: Assessment;
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();

  @ViewChild('updateUnitsModal', { static: false }) public updateUnitsModal: ModalDirective;


  settingsForm: FormGroup;
  oldSettings: Settings;
  lossesExist: boolean;
  showUpdateDataReminder: boolean = false;
  showUpdateUnitsModal: boolean = false;
  showSuccessMessage: boolean = false;
  constructor(private settingsService: SettingsService, private indexedDbService: IndexedDbService, private convertPhastService: ConvertPhastService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.settingsForm = this.settingsService.getFormFromSettings(this.settings);
    if (this.settingsForm.controls.energyResultUnit.value === '' || !this.settingsForm.controls.energyResultUnit.value) {
      this.settingsForm = this.settingsService.setEnergyResultUnit(this.settingsForm);
      this.saveChanges(true);
    }
    this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
    if (this.phast.lossDataUnits && this.phast.lossDataUnits != this.oldSettings.unitsOfMeasure) {
      this.oldSettings.unitsOfMeasure = this.phast.lossDataUnits;
      this.showUpdateDataReminder = true;
    }
    this.lossesExist = this.lossExists(this.phast);
  }

  lossExists(phast: PHAST) {
    let phastLosses: boolean = phast.losses && Object.keys(phast.losses).length !== 0;
    let lossesExist = false;

    if (phastLosses) {
      // if a loss is added and removed, phast.losses object still has array
      lossesExist = Object.values(phast.losses).some((lossArray: []) => lossArray.length > 0);
    }

    return lossesExist;
  }
  saveChanges(bool?: boolean) {
    let id = this.settings.id;
    this.settings = this.settingsService.getSettingsFromForm(this.settingsForm);
    this.settings.id = id;
    this.settings.assessmentId = this.assessment.id;

    if (this.settings.unitsOfMeasure !== this.oldSettings.unitsOfMeasure) {
      if (this.lossesExist) {
        this.phast.lossDataUnits = this.oldSettings.unitsOfMeasure;
        this.initUpdateUnitsModal();
      }
    }
    this.indexedDbService.putSettings(this.settings).then(() => {
      this.settingsDbService.setAll().then(() => {
        this.updateSettings.emit(true);
      });
    });
  }

  updateData(showSuccess?: boolean) {
    if (this.phast.losses) {
      this.phast.losses = this.convertPhastService.convertPhastLosses(this.phast.losses, this.oldSettings, this.settings);
      if (this.phast.meteredEnergy) {
        this.phast.meteredEnergy = this.convertPhastService.convertMeteredEnergy(this.phast.meteredEnergy, this.oldSettings, this.settings);
      }
      if (this.phast.designedEnergy) {
        this.phast.designedEnergy = this.convertPhastService.convertDesignedEnergy(this.phast.designedEnergy, this.oldSettings, this.settings);
      }
      this.phast.operatingCosts = this.convertPhastService.convertOperatingCosts(this.phast.operatingCosts, this.oldSettings, this.settings);
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
          mod.phast.operatingCosts = this.convertPhastService.convertOperatingCosts(mod.phast.operatingCosts, this.oldSettings, this.settings);
        });
      }

      if (showSuccess) {
        this.initSuccessMessage();
      }
      this.showUpdateDataReminder = false;
      this.save.emit(true);

      this.oldSettings = this.settingsService.getSettingsFromForm(this.settingsForm);
      this.phast.lossDataUnits = this.oldSettings.unitsOfMeasure;
    }
  }

  initUpdateUnitsModal() {
    this.showUpdateUnitsModal = true;
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

  closeUpdateUnitsModal() {
    this.showUpdateUnitsModal = false;
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    } else {
      this.showUpdateDataReminder = true;
      this.save.emit(true);
    }
    this.showUpdateUnitsModal = false;
  }

}
