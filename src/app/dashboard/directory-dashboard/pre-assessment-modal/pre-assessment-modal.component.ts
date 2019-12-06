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
  constructor(private directoryDbService: DirectoryDbService, private directoryDashboardService: DirectoryDashboardService, private settingsDbService: SettingsDbService,
    private indexedDbService: IndexedDbService, private calculatorDbService: CalculatorDbService) { }

  ngOnInit() {
    console.log('init');
    
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.directorySettings = this.settingsDbService.getByDirectoryId(directoryId);
    let preAssessmentCalculatorIndex: number = this.directoryDashboardService.showPreAssessmentModalIndex.getValue();
    this.preAssessmentCalculator = this.directory.calculators[preAssessmentCalculatorIndex];

  }

  ngAfterViewInit() {
    this.showPreAssessmentModal();
  }

  showPreAssessmentModal() {
    this.preAssessmentModal.show();
  }

  hidePreAssessmentModal() {
    this.preAssessmentModal.hide();
    this.preAssessmentModal.onHidden.subscribe(val => {
      this.directoryDashboardService.showPreAssessmentModalIndex.next(undefined);
    });
  }

}
