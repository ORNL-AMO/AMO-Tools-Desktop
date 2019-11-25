import { Component, OnInit } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';
import { ActivatedRoute } from '@angular/router';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from './directory-dashboard.service';
import { AssessmentService } from '../assessment/assessment.service';

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
  constructor(private activatedRoute: ActivatedRoute, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService,
    private directoryDashboardService: DirectoryDashboardService, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.directoryId = Number(params['id']);
      this.directory = this.directoryDbService.getById(this.directoryId);
      this.directorySettings = this.settingsDbService.getByDirectoryId(this.directoryId);
    });
    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
    this.selectAllSub = this.directoryDashboardService.selectAll.subscribe(val => {
      this.selectAll(val);
    });
    this.assessmentService.updateSidebarData.subscribe(val => {
      if (val) {
        this.directory = this.directoryDbService.getById(this.directoryId);
      }
    });
  }

  ngOnDestroy() {
    this.dashboardViewSub.unsubscribe();
    this.selectAllSub.unsubscribe();
    this.directoryDashboardService.selectAll.next(false);
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
