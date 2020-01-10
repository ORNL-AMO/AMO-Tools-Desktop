import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../log-tool.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-log-tool-banner',
  templateUrl: './log-tool-banner.component.html',
  styleUrls: ['./log-tool-banner.component.css']
})
export class LogToolBannerComponent implements OnInit {

  dataSubmitted: boolean;
  dataSubmittedSub: Subscription;
  constructor(private logToolService: LogToolService) { }

  ngOnInit() {
    this.dataSubmittedSub = this.logToolService.dataSubmitted.subscribe(val => {
      this.dataSubmitted = val;
    })
  }

  ngOnDestroy(){
    this.dataSubmittedSub.unsubscribe();
  }

}
