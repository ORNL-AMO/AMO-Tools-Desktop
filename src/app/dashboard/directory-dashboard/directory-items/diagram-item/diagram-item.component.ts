import { Component, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription, firstValueFrom } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Directory } from '../../../../shared/models/directory';
import _ from 'lodash';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { DashboardService } from '../../../dashboard.service';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { DiagramIdbService } from '../../../../indexedDb/diagram-idb.service';
import { Settings } from '../../../../shared/models/settings';
import { AssessmentDbService } from '../../../../indexedDb/assessment-db.service';
import { Diagram } from '../../../../shared/models/diagram';
import { WaterDiagramConnectionsService } from '../../../../water-process-diagram/water-diagram-connections.service';

@Component({
  selector: 'app-diagram-item',
  standalone: false,
  templateUrl: './diagram-item.component.html',
  styleUrl: './diagram-item.component.css'
})
export class DiagramItemComponent {
  @Input()
  diagram: Diagram;

  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;
  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;

  dropdownOpen: boolean = false;
  dashboardViewSub: Subscription;
  dashboardView: string;
  editForm: UntypedFormGroup;
  copyForm: UntypedFormGroup;
  allDirectories: Array<Directory>;

  updateDashboardDataSub: Subscription;

  constructor(private directoryDashboardService: DirectoryDashboardService,
    private diagramIdbService: DiagramIdbService,
    private assessmenDbService: AssessmentDbService,
    private waterDiagramConnectionsService: WaterDiagramConnectionsService,
    private formBuilder: UntypedFormBuilder,    
    private dashboardService: DashboardService, 
    private directoryDbService: DirectoryDbService, 
    private settingsDbService: SettingsDbService,
  ) { }

  ngOnInit(): void {
    this.diagram.selected = false;
    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.setDirectories();
    });
  }

  ngOnDestroy() {
    this.dashboardViewSub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
  }

  async setDirectories() {
    this.allDirectories = await firstValueFrom(this.directoryDbService.getAllDirectories());
  }

  updateSelectedStatus() {
    this.directoryDashboardService.updateSelectedStatus.next(true);
  }


  goToDiagram() {
    let diagramRoute: string = 'process-flow-diagram';
    this.dashboardService.navigateWithSidebarOptions(`/${diagramRoute}/${this.diagram.id}`, {shouldCollapse: true})
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.diagram.name, Validators.required],
      'directoryId': [this.diagram.directoryId, Validators.required]
    });
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  async save() {
    this.diagram.name = this.editForm.controls.name.value;
    this.directoryDbService.setIsMovedExample(this.diagram, this.editForm);
    this.diagram.directoryId = this.editForm.controls.directoryId.value;
    await firstValueFrom(this.diagramIdbService.updateWithObservable(this.diagram));
    let updatedDiagrams: Diagram[] = await firstValueFrom(this.diagramIdbService.getAllDiagrams());
    this.diagramIdbService.setAll(updatedDiagrams);
    this.dashboardService.updateDashboardData.next(true);
    this.hideEditModal();

  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.allDirectories, (dir) => { return dir.id === id; });
    let str = parentDir.name + '/';
    while (parentDir.parentDirectoryId) {
      parentDir = _.find(this.allDirectories, (dir) => { return dir.id === parentDir.parentDirectoryId; });
      str = parentDir.name + '/' + str;
    }
    return str;
  }

  showDeleteModal() {
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModal.hide();
  }

  async deleteDiagram() {
    let deleteSettings: Settings = this.settingsDbService.getByDiagramId(this.diagram);
    this.removeAssessmentConnection();
    let updatedDiagrams: Diagram[] = await firstValueFrom(this.diagramIdbService.deleteByIdWithObservable(this.diagram.id));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.deleteByIdWithObservable(deleteSettings.id));
    this.diagramIdbService.setAll(updatedDiagrams);
    this.settingsDbService.setAll(updatedSettings);
    this.dashboardService.updateDashboardData.next(true);
    this.hideDeleteModal();
  }

  removeAssessmentConnection() {
    if (this.diagram.waterDiagram) {
      this.waterDiagramConnectionsService.disconnectAssessment(this.diagram.assessmentId);
    }
  }

  showCopyModal() {
    this.copyForm = this.formBuilder.group({
      'name': [this.diagram.name + ' (copy)', Validators.required],
      'directoryId': [this.diagram.directoryId, Validators.required],
    });
    this.copyModal.show();
  }

  hideCopyModal() {
    this.copyModal.hide();
  }

  async createCopy() {
    let diagramCopy: Diagram = JSON.parse(JSON.stringify(this.diagram));
    delete diagramCopy.id;
    let tmpSettings: Settings = this.settingsDbService.getByDiagramId(this.diagram);
    let settingsCopy: Settings = JSON.parse(JSON.stringify(tmpSettings));
    delete settingsCopy.id;
    
    diagramCopy.name = this.copyForm.controls.name.value;
    diagramCopy.directoryId = this.copyForm.controls.directoryId.value;

    let newDiagram: Diagram = await firstValueFrom(this.diagramIdbService.addWithObservable(diagramCopy));
    settingsCopy.diagramId = newDiagram.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(settingsCopy));

    let updatedDiagrams: Diagram[] = await firstValueFrom(this.diagramIdbService.getAllDiagrams());
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.diagramIdbService.setAll(updatedDiagrams);
    this.settingsDbService.setAll(updatedSettings);
    this.dashboardService.updateDashboardData.next(true);
    this.hideCopyModal();
  }

}
