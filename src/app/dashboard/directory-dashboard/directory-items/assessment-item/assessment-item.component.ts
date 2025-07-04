import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../shared/models/assessment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Directory } from '../../../../shared/models/directory';
 
import * as _ from 'lodash';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AssessmentDbService } from '../../../../indexedDb/assessment-db.service';
import { SettingsDbService } from '../../../../indexedDb/settings-db.service';
import { Settings } from '../../../../shared/models/settings';
import { CalculatorDbService } from '../../../../indexedDb/calculator-db.service';
import { Calculator } from '../../../../shared/models/calculators';
import { AssessmentService } from '../../../assessment.service';
import { DashboardService } from '../../../dashboard.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { PsatIntegrationService } from '../../../../shared/connected-inventory/psat-integration.service';
import { UpdateAssessmentFromDiagramService } from '../../../../water/update-assessment-from-diagram.service';

@Component({
    selector: 'app-assessment-item',
    templateUrl: './assessment-item.component.html',
    styleUrls: ['./assessment-item.component.css'],
    standalone: false
})
export class AssessmentItemComponent implements OnInit {
  @Input()
  assessment: Assessment;

  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;
  @ViewChild('copyModal', { static: false }) public copyModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) public deleteModal: ModalDirective;
  allDirectories: Array<Directory>;
  editForm: UntypedFormGroup;
  copyForm: UntypedFormGroup;
  dropdownOpen: boolean = false;
  updateDashboardDataSub: Subscription;
  dashboardView: string;
  dashboardViewSub: Subscription;
  isSetup: boolean;
  constructor(private assessmentService: AssessmentService,
       private formBuilder: UntypedFormBuilder,
    private assessmentDbService: AssessmentDbService, private settingsDbService: SettingsDbService,
    private calculatorDbService: CalculatorDbService, private dashboardService: DashboardService,
    private updateAssessmentFromDiagramService: UpdateAssessmentFromDiagramService,
    private psatIntegrationService: PsatIntegrationService,
    private directoryDbService: DirectoryDbService, private directoryDashboardService: DirectoryDashboardService) { }


  ngOnInit() {
    this.assessment.selected = false;
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      this.setDirectories();
    });

    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });

    if (this.assessment.type == 'PHAST' && this.assessment.phast) {
      this.isSetup = this.assessment.phast.setupDone;
    } else if (this.assessment.type == 'PSAT' && this.assessment.psat) {
      this.isSetup = this.assessment.psat.setupDone;
    } else if (this.assessment.type == 'FSAT' && this.assessment.fsat) {
      this.isSetup = this.assessment.fsat.setupDone;
    } else if (this.assessment.type == 'SSMT' && this.assessment.ssmt) {
      this.isSetup = this.assessment.ssmt.setupDone;
    } else if (this.assessment.type == 'TreasureHunt' && this.assessment.treasureHunt) {
      this.isSetup = this.assessment.treasureHunt.setupDone;
    } else if (this.assessment.type == 'WasteWater' && this.assessment.wasteWater) {
      this.isSetup = this.assessment.wasteWater.setupDone;
    } else if (this.assessment.type == 'CompressedAir' && this.assessment.compressedAirAssessment) {
      this.isSetup = this.assessment.compressedAirAssessment.setupDone;
    }
  }

  ngOnDestroy() {
    this.updateDashboardDataSub.unsubscribe();
    this.dashboardViewSub.unsubscribe();
  }

  async setDirectories() {
    this.allDirectories = await firstValueFrom(this.directoryDbService.getAllDirectories());
  }

  updateSelectedStatus() {
    this.directoryDashboardService.updateSelectedStatus.next(true);
  }

  goToAssessment(assessment: Assessment) {
    this.assessmentService.goToAssessment(assessment);
  }

  showEditModal() {
    this.editForm = this.formBuilder.group({
      'name': [this.assessment.name, Validators.required],
      'directoryId': [this.assessment.directoryId, Validators.required]
    });
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  showCopyModal() {
    this.copyForm = this.formBuilder.group({
      'name': [this.assessment.name + ' (copy)', Validators.required],
      'directoryId': [this.assessment.directoryId, Validators.required],
      'copyModifications': [true],
      'copyCalculators': [false]
    });
    this.copyModal.show();
  }

  hideCopyModal() {
    this.copyModal.hide();
  }

  async createCopy() {
    let assessmentCopy: Assessment = JSON.parse(JSON.stringify(this.assessment));
    delete assessmentCopy.id;
    let tmpCalculator: Calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    let assessmentCalculatorCopy: Calculator;
    if (tmpCalculator) {
      assessmentCalculatorCopy = JSON.parse(JSON.stringify(tmpCalculator));
      delete assessmentCalculatorCopy.id;
    }
    let tmpSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment);
    let settingsCopy: Settings = JSON.parse(JSON.stringify(tmpSettings));
    delete settingsCopy.id;
    assessmentCopy.name = this.copyForm.controls.name.value;
    assessmentCopy.isExample = false;
    assessmentCopy.directoryId = this.copyForm.controls.directoryId.value;
    assessmentCopy.createdDate = new Date();
    assessmentCopy.modifiedDate = new Date();

    if (this.copyForm.controls.copyModifications.value === false) {
      if (assessmentCopy.type === 'PHAST') {
        assessmentCopy.phast.modifications = new Array();
      } else if (assessmentCopy.type === 'PSAT') {
        assessmentCopy.psat.modifications = new Array();
      } else if (assessmentCopy.type == 'FSAT') {
        assessmentCopy.fsat.modifications = new Array();
      } else if (assessmentCopy.type == 'SSMT') {
        assessmentCopy.ssmt.modifications = new Array();
      } else if (assessmentCopy.type === 'CompressedAir') {
        assessmentCopy.compressedAirAssessment.modifications = new Array();
      } else if (assessmentCopy.type === 'WasteWater') {
        assessmentCopy.wasteWater.modifications = new Array();
      }
    }


    let addedAssessment: Assessment = await firstValueFrom(this.assessmentDbService.addWithObservable(assessmentCopy));
    let updatedAssessments = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(updatedAssessments);
    settingsCopy.assessmentId = addedAssessment.id;

    await firstValueFrom(this.settingsDbService.addWithObservable(settingsCopy));
    let allSettings: Settings[] =  await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(allSettings);

    if (this.copyForm.controls.copyCalculators.value === true) {
      assessmentCalculatorCopy.assessmentId = addedAssessment.id;
      await firstValueFrom(this.calculatorDbService.addWithObservable(assessmentCalculatorCopy));
      let allCalculators: Calculator[] =  await firstValueFrom(this.calculatorDbService.getAllCalculators());
      this.calculatorDbService.setAll(allCalculators);
    } 
    
    this.dashboardService.updateDashboardData.next(true);
    this.hideCopyModal();
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

  async save() {
    this.assessment.name = this.editForm.controls.name.value;
    this.directoryDbService.setIsMovedExample(this.assessment, this.editForm);
    this.assessment.directoryId = this.editForm.controls.directoryId.value;
    await firstValueFrom(this.assessmentDbService.updateWithObservable(this.assessment));
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());

    this.assessmentDbService.setAll(assessments);
    this.dashboardService.updateDashboardData.next(true);
    this.hideEditModal();
  }

  showDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  showDeleteModal() {
    this.deleteModal.show();
  }

  hideDeleteModal() {
    this.deleteModal.hide();
  }

  async deleteAssessment() {
    let deleteSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment);

    this.deleteConnectedInventoryItem(this.assessment);
    this.removeDiagramConnection();
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.deleteByIdWithObservable(this.assessment.id)); 
    this.assessmentDbService.setAll(assessments);
    let settings: Settings[] = await firstValueFrom(this.settingsDbService.deleteByIdWithObservable(deleteSettings.id)); 
    this.settingsDbService.setAll(settings); 

    let assessmentCalculatorCopy: Calculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (assessmentCalculatorCopy) {
      let calculators: Calculator[] = await firstValueFrom(this.calculatorDbService.deleteByIdWithObservable(assessmentCalculatorCopy.id)); 
      this.calculatorDbService.setAll(calculators); 
    } 

    this.dashboardService.updateDashboardData.next(true);
    this.hideDeleteModal();
  }

  removeDiagramConnection() {
    if (this.assessment.diagramId) {
      if (this.assessment.type === 'Water') {
        this.updateAssessmentFromDiagramService.disconnectDiagram(this.assessment.diagramId);
      } 
    }
  }

  deleteConnectedInventoryItem(assessment: Assessment) {
    if (assessment.psat && assessment.psat.connectedItem) {
      if (assessment.psat.connectedItem.inventoryType === 'pump') {
        this.psatIntegrationService.removeConnectedPumpInventory(assessment.psat.connectedItem, assessment.id);
      } else if (assessment.psat.connectedItem.inventoryType === 'motor') {
        this.psatIntegrationService.removeMotorConnectedItem(assessment.psat.connectedItem);
      }
    }
  }

}
