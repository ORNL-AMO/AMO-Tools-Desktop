import { Component, Input, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import _ from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom } from 'rxjs';
import { ConvertFanAnalysisService } from '../../calculator/fans/fan-analysis/convert-fan-analysis.service';
import { AssessmentService } from '../../dashboard/assessment.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { DirectoryDashboardService } from '../../dashboard/directory-dashboard/directory-dashboard.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Assessment } from '../models/assessment';
import { Directory } from '../models/directory';
import { Settings } from '../models/settings';
import { ConnectedInventoryData, ConnectedItem } from '../assessment-integration/integrations';
import { PsatIntegrationService } from '../assessment-integration/psat-integration.service';
import { IntegrationStateService } from '../assessment-integration/integration-state.service';
import { SettingsService } from '../../settings/settings.service';

@Component({
  selector: 'app-create-assessment-modal',
  templateUrl: './create-assessment-modal.component.html',
  styleUrls: ['./create-assessment-modal.component.css']
})
export class CreateAssessmentModalComponent {
  @ViewChild('createModal', { static: false }) public createModal: ModalDirective;
  @Input()
  connectedInventoryItem: ConnectedItem;
  @Input() 
  integratedCreateType: string;
  newAssessmentForm: UntypedFormGroup;
  directories: Array<Directory>;
  showNewFolder: boolean = false;
  newFolderForm: UntypedFormGroup;
  directory: Directory;
  settings: Settings;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private assessmentService: AssessmentService,
    private settingsDbService: SettingsDbService,
    private assessmentDbService: AssessmentDbService,
    private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService,
    private convertFanAnalysisService: ConvertFanAnalysisService,
    private psatIntegrationService: PsatIntegrationService,
    private integrationStateService: IntegrationStateService,
    private settingsService: SettingsService,
    ) { }

  ngOnInit() {
    this.setDirectories();
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.settings = this.settingsDbService.getByDirectoryId(directoryId);
    this.newAssessmentForm = this.initForm();
    this.newFolderForm = this.initFolderForm();
    if (this.dashboardService.newAssessmentType) {
      this.newAssessmentForm.patchValue({
        assessmentType: this.dashboardService.newAssessmentType
      });
    }
  }

  ngAfterViewInit() {
    this.showCreateModal();
  }

  async setDirectories() {
    this.directories = await firstValueFrom(this.directoryDbService.getAllDirectories());
  }

  initForm() {
    let defaultName: string = 'New Assessment';
    let defaultType: string = this.integratedCreateType? this.integratedCreateType : 'Pump';
    let disableAssessmentType: boolean = Boolean(this.integratedCreateType);
    return this.formBuilder.group({
      'assessmentName': [defaultName, Validators.required],
      'assessmentType': [{ value: defaultType, disabled: disableAssessmentType }, Validators.required],
      'directoryId': [this.directory.id, Validators.required]
    });
  }

  //  CREATE ASSESSMENT MODAL
  showCreateModal() {
    this.createModal.show();
  }

  hideCreateModal() {
    this.createModal.hide();
    this.dashboardService.newAssessmentType = undefined;
    this.dashboardService.createAssessment.next(false);
  }

  async createAssessment() {
    if (this.newAssessmentForm.valid) {
      this.assessmentService.tab = 'system-setup';
      if (this.newAssessmentForm.controls.assessmentType.value === 'Pump') {
        let psatAssessment: Assessment = this.assessmentService.getNewAssessment('PSAT');
        psatAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        let newPsat = this.assessmentService.getNewPsat(this.settings);

        psatAssessment.psat = newPsat;
        psatAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(psatAssessment));
        let queryParams;
        if (this.connectedInventoryItem) {
          await this.createFromPumpInventoryItem(createdAssessment);
          queryParams = { connectedInventory: true };
        }
        let navigationUrl: string = '/psat/' + createdAssessment.id;
        this.finishAndNavigate(createdAssessment, navigationUrl, queryParams);
      }
      else if (this.newAssessmentForm.controls.assessmentType.value === 'Furnace') {
        let tmpAssessment: Assessment = this.assessmentService.getNewAssessment('PHAST');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        let tmpPhast = this.assessmentService.getNewPhast(this.settings);
        tmpAssessment.phast = tmpPhast;
        tmpAssessment.phast.setupDone = false;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(tmpAssessment));
        this.finishAndNavigate(createdAssessment, '/phast/' + createdAssessment.id);
      }
      else if (this.newAssessmentForm.controls.assessmentType.value === 'Fan') {
        let tmpAssessment: Assessment = this.assessmentService.getNewAssessment('FSAT');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        tmpAssessment.fsat = this.assessmentService.getNewFsat(this.settings);
        tmpAssessment.fsat.baseGasDensity = this.convertFanAnalysisService.convertBaseGasDensityDefaults(tmpAssessment.fsat.baseGasDensity, this.settings)
        let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(tmpAssessment));
        this.finishAndNavigate(createdAssessment, '/fsat/' + createdAssessment.id);
      }
      else if (this.newAssessmentForm.controls.assessmentType.value === 'Steam') {
        let tmpAssessment: Assessment = this.assessmentService.getNewAssessment('SSMT');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        tmpAssessment.ssmt = this.assessmentService.getNewSsmt();
        let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(tmpAssessment));
        this.finishAndNavigate(createdAssessment, '/ssmt/' + createdAssessment.id);
      }
      else if (this.newAssessmentForm.controls.assessmentType.value == 'TreasureHunt') {
        let tmpAssessment: Assessment = this.assessmentService.getNewAssessment('TreasureHunt');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(tmpAssessment));
        this.finishAndNavigate(createdAssessment, '/treasure-hunt/' + createdAssessment.id);
      } 
      else if (this.newAssessmentForm.controls.assessmentType.value == 'WasteWater') {
        let tmpAssessment = this.assessmentService.getNewAssessment('WasteWater');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        tmpAssessment.wasteWater = this.assessmentService.getNewWasteWater(this.settings);
        let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(tmpAssessment));
        this.finishAndNavigate(createdAssessment, '/waste-water/' + createdAssessment.id);
      }
      else if (this.newAssessmentForm.controls.assessmentType.value == 'CompressedAir') {
        let tmpAssessment = this.assessmentService.getNewAssessment('CompressedAir');
        tmpAssessment.name = this.newAssessmentForm.controls.assessmentName.value;
        tmpAssessment.directoryId = this.newAssessmentForm.controls.directoryId.value;
        tmpAssessment.compressedAirAssessment = this.assessmentService.getNewCompressedAirAssessment(this.settings);
        let createdAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(tmpAssessment));
        this.finishAndNavigate(createdAssessment, '/compressed-air/' + createdAssessment.id);
      }
    }
  }

  async createFromPumpInventoryItem(createdAssessment: Assessment) {
    let connectedInventoryData: ConnectedInventoryData = this.integrationStateService.connectedInventoryData.getValue();
    connectedInventoryData.connectedItem = this.connectedInventoryItem;
    connectedInventoryData.canConnect = true;

    let assessmentSettings = this.settingsDbService.getByAssessmentId(createdAssessment, false);
    let newSettings: Settings = this.settingsService.getNewSettingFromSetting(assessmentSettings);
    newSettings = this.settingsService.setPumpSettingsUnitType(newSettings);
    await this.psatIntegrationService.setPSATFromExistingPumpItem(connectedInventoryData, createdAssessment.psat, createdAssessment, newSettings);
    await this.saveAssessmentAndSettings(newSettings, createdAssessment)
  }

  async saveAssessmentAndSettings(settings: Settings, assessment: Assessment) {
    let settingsForm = this.settingsService.getFormFromSettings(settings);
    settingsForm = this.settingsService.setUnits(settingsForm);
    settings = this.settingsService.getSettingsFromForm(settingsForm);
    settings.assessmentId = assessment.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(settings));
    let updatedSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    await this.settingsDbService.setAll(updatedSettings);
    await firstValueFrom(this.assessmentDbService.updateWithObservable(assessment));
    let allAssessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(allAssessments);
  }

  async finishAndNavigate(assessment: Assessment, navigationUrl: string, queryParams?) {
    this.assessmentDbService.setAll();
    this.hideCreateModal();
    this.createModal.onHidden.subscribe(() => {
      this.dashboardService.navigateWithSidebarOptions(navigationUrl, {shouldCollapse: true}, queryParams)
    });
  }


  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id === id; });
    if (parentDir) {
      let str = parentDir.name + '/';
      while (parentDir.parentDirectoryId) {
        parentDir = _.find(this.directories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
        str = parentDir.name + '/' + str;
      }
      return str;
    } else {
      return '';
    }
  }


  addFolder() {
    this.showNewFolder = true;
  }

  cancelNewFolder() {
    this.showNewFolder = false;
  }


  async createFolder() {
    let tmpFolder: Directory = {
      name: this.newFolderForm.controls.folderName.value,
      parentDirectoryId: this.newFolderForm.controls.directoryId.value
    };
    let tmpSettings: Settings = this.settingsDbService.getByDirectoryId(this.newFolderForm.controls.directoryId.value);
    delete tmpSettings.facilityInfo;
    delete tmpSettings.id;
    if (this.newFolderForm.controls.companyName.value || this.newFolderForm.controls.facilityName.value) {
      tmpSettings.facilityInfo = {
        companyName: this.newFolderForm.controls.companyName.value,
        facilityName: this.newFolderForm.controls.facilityName.value,
        date: new Date().toLocaleDateString()
      };
    }


    let createdDirectory: Directory = await firstValueFrom(this.directoryDbService.addWithObservable(tmpFolder))
    tmpSettings.directoryId = createdDirectory.id;
    this.directories = await firstValueFrom(this.directoryDbService.getAllDirectories());
    this.directoryDbService.setAll(this.directories);
    
    await firstValueFrom(this.settingsDbService.addWithObservable(tmpSettings));
    let allSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(allSettings);

    this.newAssessmentForm.patchValue({
      'directoryId': createdDirectory.id
    });
    this.cancelNewFolder();
  }

  initFolderForm() {
    return this.formBuilder.group({
      'folderName': ['', Validators.required],
      'companyName': [''],
      'facilityName': [''],
      'directoryId': [this.directory.id, Validators.required]
    });
  }
}
