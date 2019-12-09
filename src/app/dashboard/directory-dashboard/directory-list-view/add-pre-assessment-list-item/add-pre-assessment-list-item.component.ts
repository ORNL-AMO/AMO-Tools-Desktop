import { Component, OnInit } from '@angular/core';
import { Directory } from '../../../../shared/models/directory';
import { Subscription } from 'rxjs';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';

@Component({
  selector: 'app-add-pre-assessment-list-item',
  templateUrl: './add-pre-assessment-list-item.component.html',
  styleUrls: ['./add-pre-assessment-list-item.component.css']
})
export class AddPreAssessmentListItemComponent implements OnInit {

  directory: Directory;
  directoryIdSub: Subscription;
  constructor(private directoryDbService: DirectoryDbService, private directoryDashboardService: DirectoryDashboardService) { }

  ngOnInit() {
    this.directoryIdSub = this.directoryDashboardService.selectedDirectoryId.subscribe(directoryId => {
      this.directory = this.directoryDbService.getById(directoryId);
    })
  }

  ngOnDestroy() {
    this.directoryIdSub.unsubscribe();
  }


  showPreAssessment() {
    this.directoryDashboardService.showPreAssessmentModalIndex.next({ index: 0, isNew: true });
  }
}
