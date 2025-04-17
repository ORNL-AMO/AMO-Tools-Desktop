import { Component, OnInit } from '@angular/core';
import { Directory } from '../../../../shared/models/directory';
import { Subscription } from 'rxjs';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { DirectoryDashboardService } from '../../directory-dashboard.service';

@Component({
    selector: 'app-add-pre-assessment-item',
    templateUrl: './add-pre-assessment-item.component.html',
    styleUrls: ['./add-pre-assessment-item.component.css'],
    standalone: false
})
export class AddPreAssessmentItemComponent implements OnInit {

  directory: Directory;
  directoryIdSub: Subscription;
  dashboardView: string;
  dashboardViewSub: Subscription;
  constructor(private directoryDbService: DirectoryDbService, private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit() {
    this.directoryIdSub = this.directoryDashboardService.selectedDirectoryId.subscribe(directoryId => {
      this.directory = this.directoryDbService.getById(directoryId);
    });

    this.dashboardViewSub = this.directoryDashboardService.dashboardView.subscribe(val => {
      this.dashboardView = val;
    });
  }

  ngOnDestroy() {
    this.directoryIdSub.unsubscribe();
    this.dashboardViewSub.unsubscribe();
  }


  showPreAssessment() {
    this.directoryDashboardService.showPreAssessmentModalIndex.next({ index: 0, isNew: true });
  }
}
