import { Component, OnInit } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';
import { ActivatedRoute } from '@angular/router';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from './directory-dashboard.service';
import { AssessmentService } from '../../assessment/assessment.service';
import { DashboardService } from '../dashboard.service';
import { Calculator } from '../../shared/models/calculators';

@Component({
  selector: 'app-directory-dashboard',
  templateUrl: './directory-dashboard.component.html',
  styleUrls: ['./directory-dashboard.component.css']
})
export class DirectoryDashboardComponent implements OnInit {

  directory: Directory;
  directorySettings: Settings;
  selectAllSub: Subscription;
  dashboardView: string;
  dashboardViewSub: Subscription;
  directoryId: number;
  showDeleteItemsModal: boolean;
  showDeleteItemsModalSub: Subscription;
  showPreAssessmentModalSub: Subscription;
  showPreAssessmentModalIndex: { index: number, isNew: boolean };
  constructor(private activatedRoute: ActivatedRoute, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService,
    private directoryDashboardService: DirectoryDashboardService, private dashboardService: DashboardService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.directoryId = Number(params['id']);
      this.directoryDashboardService.selectedDirectoryId.next(this.directoryId);
      this.directory = this.directoryDbService.getById(this.directoryId);
      this.directorySettings = this.settingsDbService.getByDirectoryId(this.directoryId);
    });
    this.selectAllSub = this.directoryDashboardService.selectAll.subscribe(val => {
      this.selectAll(val);
    });
    this.dashboardService.updateSidebarData.subscribe(val => {
      if (val) {
        this.directory = this.directoryDbService.getById(this.directoryId);
        console.log(this.directory);
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
    this.selectAllSub.unsubscribe();
    this.directoryDashboardService.selectAll.next(false);
    this.directoryDashboardService.selectedDirectoryId.next(1);
    this.showDeleteItemsModalSub.unsubscribe();
    this.showPreAssessmentModalSub.unsubscribe();
  }

  selectAll(isSelected: boolean) {
    if (this.directory) {
      this.directory.assessments.forEach(assessment => {
        assessment.selected = isSelected;
      });
      this.directory.subDirectory.forEach(subDir => {
        subDir.selected = isSelected;
      });
    }
  }

}
