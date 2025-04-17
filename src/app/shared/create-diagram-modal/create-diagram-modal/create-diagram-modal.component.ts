import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Directory } from '../../models/directory';
import { Settings } from '../../models/settings';
import { AnalyticsService } from '../../analytics/analytics.service';
import { SettingsService } from '../../../settings/settings.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import _ from 'lodash';
import { firstValueFrom } from 'rxjs';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { DirectoryDashboardService } from '../../../dashboard/directory-dashboard/directory-dashboard.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { getNameDateString } from '../../helperFunctions';
import { WaterProcessDiagramService } from '../../../water-process-diagram/water-process-diagram.service';
import { DiagramIdbService } from '../../../indexedDb/diagram-idb.service';
import { Diagram } from '../../models/diagram';

@Component({
  selector: 'app-create-diagram-modal',
  standalone: false,
  templateUrl: './create-diagram-modal.component.html',
  styleUrl: './create-diagram-modal.component.css'
})
export class CreateDiagramModalComponent {
  @ViewChild('createDiagramModal', { static: false }) public createDiagramModal: ModalDirective;
  @Output('onClose')
  onClose = new EventEmitter<boolean>();

  newDiagramForm: UntypedFormGroup;
  directories: Array<Directory>;
  showNewFolder: boolean = false;
  newFolderForm: UntypedFormGroup;
  directory: Directory;
  settings: Settings;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private waterDiagramService: WaterProcessDiagramService,
    private diagramIdbService: DiagramIdbService,
    private settingsDbService: SettingsDbService,
    private directoryDbService: DirectoryDbService,
    private directoryDashboardService: DirectoryDashboardService,
    private dashboardService: DashboardService,
    private settingsService: SettingsService,
    private analyticsService: AnalyticsService
    ) { }

  ngOnInit() {
    this.setDirectories();
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.settings = this.settingsDbService.getByDirectoryId(directoryId);
    this.newDiagramForm = this.initForm();
    this.newFolderForm = this.initFolderForm();
    if (this.dashboardService.newDiagramType) {
      this.newDiagramForm.patchValue({
        diagramType: this.dashboardService.newDiagramType
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
    let defaultType: string = 'Water';
    let defaultName: string = this.getDiagramName(defaultType);

    return this.formBuilder.group({
      'diagramName': [defaultName, Validators.required],
      'diagramType': [{ value: 'Water', disabled: true }, Validators.required],
      'directoryId': [this.directory.id, Validators.required]
    });
  }

  showCreateModal() {
    this.createDiagramModal.show();
  }

  hideCreateModal() {
    this.createDiagramModal.hide();
    this.dashboardService.newDiagramType = undefined;
    this.dashboardService.showCreateDiagram.next(false);
    this.onClose.emit(true);
  }

  getDiagramName(diagramType: string) {
    let diagramName: string = 'New Water Diagram';
    let currentDate = new Date();
    diagramName = `${diagramName}_${getNameDateString(currentDate)}`;
    return diagramName;
  }

  async createDiagram() {
    if (this.newDiagramForm.valid) {
      if (this.newDiagramForm.controls.diagramType.value == 'Water') {
        this.analyticsService.sendEvent('create-water-diagram', undefined);
        let newDiagram = this.diagramIdbService.getNewDiagram('Water');
        newDiagram.name = this.newDiagramForm.controls.diagramName.value;
        newDiagram.directoryId = this.newDiagramForm.controls.directoryId.value;
        newDiagram.waterDiagram = this.waterDiagramService.getDefaultWaterDiagram(this.settings);
        let createdDiagram: Diagram = await firstValueFrom(this.diagramIdbService.addWithObservable(newDiagram));

        this.diagramIdbService.setAll();
        this.hideCreateModal();

        let url: string = '/process-flow-diagram/' + createdDiagram.id;
        this.createDiagramModal.onHidden.subscribe(() => {
          this.dashboardService.navigateWithSidebarOptions(url, {shouldCollapse: true})
        });
      }
    }
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

    this.newDiagramForm.patchValue({
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
