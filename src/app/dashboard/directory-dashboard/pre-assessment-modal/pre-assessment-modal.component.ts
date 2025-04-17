import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { DirectoryDashboardService } from '../directory-dashboard.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Directory } from '../../../shared/models/directory';
import { Settings } from '../../../shared/models/settings';
 
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { Calculator } from '../../../shared/models/calculators';
import { PreAssessment } from '../../../calculator/utilities/pre-assessment/pre-assessment';
import { DashboardService } from '../../dashboard.service';
import { firstValueFrom } from 'rxjs';
import { ShowPreAssessmentModalState } from '../../../shared/models/directory-dashboard';

@Component({
    selector: 'app-pre-assessment-modal',
    templateUrl: './pre-assessment-modal.component.html',
    styleUrls: ['./pre-assessment-modal.component.css'],
    standalone: false
})
export class PreAssessmentModalComponent implements OnInit {


  @ViewChild('preAssessmentModal', { static: false }) public preAssessmentModal: ModalDirective;
  directory: Directory;
  directorySettings: Settings;
  preAssessmentCalculator: Calculator;
  modalShown: boolean;
  constructor(private directoryDbService: DirectoryDbService, private directoryDashboardService: DirectoryDashboardService, private settingsDbService: SettingsDbService, private calculatorDbService: CalculatorDbService, private dashboardService: DashboardService) { }

  ngOnInit() {
    let directoryId: number = this.directoryDashboardService.selectedDirectoryId.getValue();
    this.directory = this.directoryDbService.getById(directoryId);
    this.directorySettings = this.settingsDbService.getByDirectoryId(directoryId);
    let preAssessmentCalculatorIndex: ShowPreAssessmentModalState = this.directoryDashboardService.showPreAssessmentModalIndex.getValue();
    if (preAssessmentCalculatorIndex.isNew == false) {
      if (preAssessmentCalculatorIndex.subDirectoryId !== undefined) {
        let subDirectory = this.directory.subDirectory.find(dir => dir.id === preAssessmentCalculatorIndex.subDirectoryId);
        if (subDirectory && subDirectory.calculators?.length != 0) {
          this.preAssessmentCalculator = subDirectory.calculators[preAssessmentCalculatorIndex.index];
        }
      } else {
        this.preAssessmentCalculator = this.directory.calculators[preAssessmentCalculatorIndex.index];
      }
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
      this.modalShown = true;
    })
  }
  
  hidePreAssessmentModal() {
    this.preAssessmentModal.hide();
    this.preAssessmentModal.onHidden.subscribe(val => {
      this.directoryDashboardService.showPreAssessmentModalIndex.next(undefined);
    });
  }

  async savePreAssessment() {
    let preAssessmentCalculatorIndex: { index: number, isNew: boolean } = this.directoryDashboardService.showPreAssessmentModalIndex.getValue();
    if (preAssessmentCalculatorIndex.isNew == true) {
      await firstValueFrom(this.calculatorDbService.addWithObservable(this.preAssessmentCalculator));
      let updatedCalculators = await firstValueFrom(this.calculatorDbService.getAllCalculators());
      this.calculatorDbService.setAll(updatedCalculators);
      this.dashboardService.updateDashboardData.next(true);
      this.hidePreAssessmentModal();
    } else {
      await firstValueFrom(this.calculatorDbService.updateWithObservable(this.preAssessmentCalculator));
      let updatedCalculators: Calculator[] = await firstValueFrom(this.calculatorDbService.getAllCalculators()); 
      this.calculatorDbService.setAll(updatedCalculators);
      this.dashboardService.updateDashboardData.next(true);
      this.hidePreAssessmentModal();
    }
  }

}
