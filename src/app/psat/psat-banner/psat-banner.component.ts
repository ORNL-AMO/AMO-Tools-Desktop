import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PsatService } from '../../psat/psat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-psat-banner',
  templateUrl: './psat-banner.component.html',
  styleUrls: ['./psat-banner.component.css']
})
export class PsatBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;

  mainTab: string;
  mainTabSub: Subscription;
  constructor(private psatService: PsatService) { }

  ngOnInit() {
    this.mainTabSub = this.psatService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  ngOnDestroy(){
    this.mainTabSub.unsubscribe();
  }

  changeTab(str: string) {
    if (str == 'system-setup' || str == 'calculators') {
      this.psatService.mainTab.next(str);
    } else if (this.assessment.psat.setupDone) {
      this.psatService.mainTab.next(str);
    }
  }
}
