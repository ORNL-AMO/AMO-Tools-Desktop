import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';

@Component({
  selector: 'app-ssmt',
  templateUrl: './ssmt.component.html',
  styleUrls: ['./ssmt.component.css']
})
export class SsmtComponent implements OnInit {
  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;
  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.getContainerHeight();
  // }

  assessment: Assessment;
  constructor(
    private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService,
  ) { }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
      });
    });
  }

}
