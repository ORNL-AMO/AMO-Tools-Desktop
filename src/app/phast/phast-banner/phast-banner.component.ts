import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Assessment } from '../../shared/models/assessment';
import { PhastService } from '../phast.service';
@Component({
  selector: 'app-phast-banner',
  templateUrl: './phast-banner.component.html',
  styleUrls: ['./phast-banner.component.css']
})
export class PhastBannerComponent implements OnInit {
  @Input()
  assessment: Assessment;
  mainTab: string;
  constructor(private phastService: PhastService) { }

  ngOnInit() {
    this.phastService.mainTab.subscribe(val => {
      this.mainTab = val;
    })
  }

  changeTab(str: string) {

    this.phastService.mainTab.next(str);
    // else if (this.assessment.phast.setupDone) {
    //   this.phastService.mainTab.next(str);
    // }
  }
}
