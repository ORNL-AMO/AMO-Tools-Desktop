import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-report-banner',
  templateUrl: './report-banner.component.html',
  styleUrls: ['./report-banner.component.css']
})
export class ReportBannerComponent implements OnInit {
  @Output('emitCloseReport')
  emitCloseReport = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  closeReport(){
    this.emitCloseReport.emit(true);
  }

}
