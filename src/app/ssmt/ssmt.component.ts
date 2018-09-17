import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Assessment } from '../shared/models/assessment';
import { ActivatedRoute } from '@angular/router';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Subscription } from 'rxjs';
import { SsmtService } from './ssmt.service';

@Component({
  selector: 'app-ssmt',
  templateUrl: './ssmt.component.html',
  styleUrls: ['./ssmt.component.css']
})
export class SsmtComponent implements OnInit {
  @ViewChild('header') header: ElementRef;
  @ViewChild('footer') footer: ElementRef;
  @ViewChild('content') content: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  containerHeight: number;

  assessment: Assessment;
  mainTab: string;
  mainTabSubscription: Subscription;
  stepTab: string;
  stepTabSubscription: Subscription;
  modelTabSubscription: Subscription;
  modelTab: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private indexedDbService: IndexedDbService,
    private ssmtService: SsmtService
  ) { }

  ngOnInit() {
    let tmpAssessmentId;
    this.activatedRoute.params.subscribe(params => {
      tmpAssessmentId = params['id'];
      this.indexedDbService.getAssessment(parseInt(tmpAssessmentId)).then(dbAssessment => {
        this.assessment = dbAssessment;
      });
    });
    this.subscribeTabs();
  }
  
  ngOnDestory(){
    this.mainTabSubscription.unsubscribe();
    this.stepTabSubscription.unsubscribe();
    this.modelTabSubscription.unsubscribe();
  }


  subscribeTabs(){
    this.mainTabSubscription = this.ssmtService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
    this.stepTabSubscription = this.ssmtService.stepTab.subscribe(val => {
      this.stepTab = val;
    })
    this.modelTabSubscription = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
    })
  }

  back(){

  }

  goToReport(){

  }

  continue(){

  }

  getCanContinue(){
    return false;
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }
}
