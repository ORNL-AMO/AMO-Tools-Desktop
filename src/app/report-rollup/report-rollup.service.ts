import { Injectable } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { BehaviorSubject } from 'rxjs';
import { Directory } from '../shared/models/directory';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
@Injectable()
export class ReportRollupService {

  reportAssessments: BehaviorSubject<Array<Assessment>>;
  phastAssessments: BehaviorSubject<Array<Assessment>>;
  psatAssessments: BehaviorSubject<Array<Assessment>>;
  
  assessmentsArray: Array<Assessment>;
  phastArray: Array<Assessment>;
  psatArray: Array<Assessment>;


  constructor(private indexedDbService: IndexedDbService) {
    this.reportAssessments = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>());
    this.phastAssessments = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>())
    this.psatAssessments = new BehaviorSubject<Array<Assessment>>(new Array<Assessment>())
  }

  pushAssessment(assessment: Assessment) {
    this.assessmentsArray.push(assessment);
    this.reportAssessments.next(this.assessmentsArray);
    if(assessment.psat){
      this.psatArray.push(assessment);
      this.psatAssessments.next(this.psatArray);
    }else if(assessment.phast){
      this.phastArray.push(assessment);
      this.phastAssessments.next(this.phastArray);
    }
  }

  getReportData(directory: Directory) {
    this.assessmentsArray = new Array<Assessment>();
    this.phastArray = new Array<Assessment>();
    this.psatArray = new Array<Assessment>();

    directory.assessments.forEach(assessment => {
      if (assessment.selected) {
        this.pushAssessment(assessment);
      }
    });

    directory.subDirectory.forEach(subDir => {
      if (subDir.selected) {
        this.getDirectoryAssessments(subDir.id);
        this.getChildDirectories(subDir);
      }
    })
  }

  getChildDirectories(subDir: Directory) {

    this.indexedDbService.getChildrenDirectories(subDir.id).then(subDirResults => {
      if (subDirResults) {
        subDirResults.forEach(dir => {
          this.getDirectoryAssessments(dir.id);
          this.getChildDirectories(dir);
        })
      }
    })
  }

  getDirectoryAssessments(dirId: number) {
    this.indexedDbService.getDirectoryAssessments(dirId).then(results => {
      if (results) {
        results.forEach(assessment => {
          this.pushAssessment(assessment);
        })
      }
    })
  }

}
