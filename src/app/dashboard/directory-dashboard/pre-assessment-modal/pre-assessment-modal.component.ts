import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Directory } from '../../../shared/models/directory';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Calculator } from '../../../shared/models/calculators';
import { PreAssessment } from '../../../calculator/utilities/pre-assessment/pre-assessment';
import { DashboardService } from '../../dashboard.service';

@Component({
  selector: 'app-pre-assessment-modal',
  templateUrl: './pre-assessment-modal.component.html',
  styleUrls: ['./pre-assessment-modal.component.css']
})
export class PreAssessmentModalComponent implements OnInit {


  @ViewChild('preAssessmentModal', { static: false }) public preAssessmentModal: ModalDirective;
  directory: Directory;
  directorySettings: Settings;
  preAssessmentCalculator: Calculator;
  modalShown: boolean;
  constructor(private directoryDbService: DirectoryDbService, private directoryDashboardService: DirectoryDashboardService, private settingsDbService: SettingsDbService,
    private indexedDbService: IndexedDbService, private calculatorDbService: CalculatorDbService, private dashboardService: DashboardService) { }

  ngOnInit() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.directorySettings = this.settingsDbService.getByDirectoryId(directoryId);
    let preAssessmentCalculatorIndex: { index: number, isNew: boolean } = this.directoryDashboardService.showPreAssessmentModalIndex.getValue();
    if (preAssessmentCalculatorIndex.isNew == false) {
      this.preAssessmentCalculator = this.directory.calculators[preAssessmentCalculatorIndex.index];
    } else {
      this.preAssessmentCalculator = {
        directoryId: this.directory.id,
        name: '',
        preAssessments: new Array<PreAssessment>(),
        selected: false
      }
    }

  }

  ngAfterViewInit() {
    this.showPreAssessmentModal();
  }

  showPreAssessmentModal() {
    this.preAssessmentModal.show();
    this.preAssessmentModal.onShown.subscribe(val => {
      this.modalShown = val;
    })
  }

  hidePreAssessmentModal() {
    this.preAssessmentModal.hide();
    this.preAssessmentModal.onHidden.subscribe(val => {
      this.directoryDashboardService.showPreAssessmentModalIndex.next(undefined);
    });
  }

  savePreAssessment() {
    let preAssessmentCalculatorIndex: { index: number, isNew: boolean } = this.directoryDashboardService.showPreAssessmentModalIndex.getValue();
    if (preAssessmentCalculatorIndex.isNew == true) {
      this.indexedDbService.addCalculator(this.preAssessmentCalculator).then(calculatorId => {
        this.updateAllAndClose();
      });
    } else {
      this.indexedDbService.putCalculator(this.preAssessmentCalculator).then(() => {
        this.updateAllAndClose();
      })
    }
  }

  updateAllAndClose() {
    this.calculatorDbService.setAll().then(() => {
      this.dashboardService.updateDashboardData.next(true);
      this.hidePreAssessmentModal();
    });
  }

}
