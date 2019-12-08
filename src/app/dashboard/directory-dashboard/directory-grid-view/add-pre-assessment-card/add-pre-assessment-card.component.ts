import { Component, OnInit } from '@angular/core';
import { Directory } from '../../../../shared/models/directory';
import { DirectoryDbService } from '../../../../indexedDb/directory-db.service';
import { DirectoryDashboardService } from '../../directory-dashboard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-pre-assessment-card',
  templateUrl: './add-pre-assessment-card.component.html',
  styleUrls: ['./add-pre-assessment-card.component.css']
})
export class AddPreAssessmentCardComponent implements OnInit {

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
