import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Assessment } from '../shared/models/assessment';

@Component({
  selector: 'app-fsat',
  templateUrl: './fsat.component.html',
  styleUrls: ['./fsat.component.css']
})
export class FsatComponent implements OnInit {

  assessment: Assessment;

  constructor(private activatedRoute: ActivatedRoute, private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
        //this.getSettings();
      })
    })
  }

}
