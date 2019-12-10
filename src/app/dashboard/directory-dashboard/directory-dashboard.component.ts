import { Component, OnInit } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { ActivatedRoute } from '@angular/router';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from './directory-dashboard.service';
import { DashboardService } from '../dashboard.service';
import { Calculator } from '../../shared/models/calculators';
import { Assessment } from '../../shared/models/assessment';

@Component({
  selector: 'app-directory-dashboard',
  templateUrl: './directory-dashboard.component.html',
  styleUrls: ['./directory-dashboard.component.css']
})
export class DirectoryDashboardComponent implements OnInit {

  directory: Directory;
  dashboardView: string;
  dashboardViewSub: Subscription;
  directoryId: number;
  showDeleteItemsModal: boolean;
  showDeleteItemsModalSub: Subscription;
  showPreAssessmentModalSub: Subscription;
  showPreAssessmentModalIndex: { index: number, isNew: boolean };
  updateDashboardDataSub: Subscription;

  directoryItems: Array<DirectoryItem>;
  displayAddPreAssessment: boolean;
  constructor(private activatedRoute: ActivatedRoute, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService,
    private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.directoryId = Number(params['id']);
      this.directoryDashboardService.selectedDirectoryId.next(this.directoryId);
      this.directory = this.directoryDbService.getById(this.directoryId);
      this.setDirectoryItems();
    });
    this.updateDashboardDataSub = this.dashboardService.updateDashboardData.subscribe(val => {
      if (val) {
        this.directory = this.directoryDbService.getById(this.directoryId);
        this.setDirectoryItems();
      }
    });
    this.showDeleteItemsModalSub = this.directoryDashboardService.showDeleteItemsModal.subscribe(val => {
      this.showDeleteItemsModal = val;
    });
    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
    this.showPreAssessmentModalSub = this.directoryDashboardService.showPreAssessmentModalIndex.subscribe(val => {
      this.showPreAssessmentModalIndex = val;
    })
  }

  ngOnDestroy() {
    this.dashboardViewSub.unsubscribe();
    this.showDeleteItemsModalSub.unsubscribe();
    this.showPreAssessmentModalSub.unsubscribe();
    this.updateDashboardDataSub.unsubscribe();
  }

  setDirectoryItems() {
    this.directoryItems = new Array();
    this.displayAddPreAssessment = true;
    let calculatorIndex: number = 0;
    this.directory.calculators.forEach(calculator => {
      this.displayAddPreAssessment = false;
      this.directoryItems.push({
        type: 'calculator',
        calculator: calculator,
        calculatorIndex: calculatorIndex
      });
      calculatorIndex++;
    })
    this.directory.assessments.forEach(assessment => {
      this.directoryItems.push({
        type: 'assessment',
        assessment: assessment
      })
    });
    this.directory.subDirectory.forEach(subDirectory => {
      this.directoryItems.push({
        type: 'directory',
        subDirectory: subDirectory
      })
    })
  }
}


export interface DirectoryItem {
  calculator?: Calculator;
  calculatorIndex?: number;
  subDirectory?: Directory;
  assessment?: Assessment;
  type: string;
}