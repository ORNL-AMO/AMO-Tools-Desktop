import { Component, OnInit } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { Settings } from '../shared/models/settings';
import { ActivatedRoute } from '@angular/router';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { DirectoryDbService } from '../indexedDb/directory-db.service';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from './directory-dashboard.service';

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
  constructor(private activatedRoute: ActivatedRoute, private directoryDbService: DirectoryDbService, private settingsDbService: SettingsDbService,
    private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      let id = Number(params['id']);
      this.directory = this.directoryDbService.getById(id);
      console.log(this.directory);
      this.directorySettings = this.settingsDbService.getByDirectoryId(id);
    });

    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
    this.selectAllSub = this.directoryDashboardService.selectAll.subscribe(val => {
      console.log('select all ' + val);
      this.selectAll(val);
    })
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
      })
    }
  }

}
