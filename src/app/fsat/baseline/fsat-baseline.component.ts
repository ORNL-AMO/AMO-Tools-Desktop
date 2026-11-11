import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FsatService } from '../fsat.service';
import { Assessment } from '../../shared/models/assessment';
import { Settings } from '../../shared/models/settings';
import { FSAT, FsatOperations, FanSetup, BaseGasDensity, FanMotor, FieldData } from '../../shared/models/fans';

@Component({
  selector: 'app-fsat-baseline',
  templateUrl: './fsat-baseline.component.html',
  styleUrls: ['./fsat-baseline.component.css'],
  standalone: false
})
export class FsatBaselineComponent implements OnInit, OnDestroy {
  fsat: FSAT;
  assessment: Assessment;
  settings: Settings;
  stepTab: string;
  containerHeight: number;
  modificationIndex: number;
  isModalOpen: boolean;
  showUpdateUnitsModal: boolean;
  smallScreenTab: string;

  private subs: Subscription[] = [];

  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.subs.push(this.fsatService.fsat.subscribe(val => this.fsat = val));
    this.subs.push(this.fsatService.assessment.subscribe(val => this.assessment = val));
    this.subs.push(this.fsatService.settings.subscribe(val => this.settings = val));
    this.subs.push(this.fsatService.stepTab.subscribe(val => this.stepTab = val));
    this.subs.push(this.fsatService.containerHeight.subscribe(val => this.containerHeight = val));
    this.subs.push(this.fsatService.modificationIndex.subscribe(val => this.modificationIndex = val));
    this.subs.push(this.fsatService.modalOpen.subscribe(val => this.isModalOpen = val));
    this.subs.push(this.fsatService.showUpdateUnitsModal.subscribe(val => this.showUpdateUnitsModal = val.show));
    this.subs.push(this.fsatService.smallScreenTab.subscribe(val => this.smallScreenTab = val));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  saveSettings(newSettings: Settings) {
    this.fsatService.updateSettings(newSettings);
  }

  saveFsat(newFsat: FSAT) {
    this.fsatService.setFsat(newFsat);
  }

  saveFsatOperations(newFsatOperations: FsatOperations) {
    this.fsatService.updateFsatProperty('fsatOperations', newFsatOperations);
  }

  saveFanSetup(newFanSetup: FanSetup) {
    this.fsatService.updateFsatProperty('fanSetup', newFanSetup);
  }

  saveGasDensity(newDensity: BaseGasDensity) {
    this.fsatService.updateFsatProperty('baseGasDensity', newDensity);
  }

  saveFanMotor(newFanMotor: FanMotor) {
    this.fsatService.updateFsatProperty('fanMotor', newFanMotor);
  }

  saveFieldData(newFieldData: FieldData) {
    this.fsatService.updateFsatProperty('fieldData', newFieldData);
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.fsatService.showUpdateUnitsModal.next({ show: true, oldSettings });
  }
}
