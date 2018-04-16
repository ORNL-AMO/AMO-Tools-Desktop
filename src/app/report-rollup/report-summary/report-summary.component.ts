import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';
import { PhastResultsData } from '../report-rollup.service';
import { setTimeout } from 'timers';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('showModal')
  showModal = new EventEmitter<boolean>();
  @Output('showPsatModal')
  showPsatModal = new EventEmitter<boolean>();
  @Input()
  phastResults: Array<PhastResultsData>;
  @Input()
  numPhasts: number;
  @Input()
  numPsats: number;

  @Output('hideSummary')
  hideSummary = new EventEmitter<boolean>();
  // @ViewChild('rollupModal') public rollupModal: ModalDirective;
  showSummary: string = 'open';
  constructor() { }

  ngOnInit() {
  }


  showFurnaceRollup() {
    this.showModal.emit(true);
  }
  // showModal() {
  //     this.rollupModal.show();
  // }

  // hideModal() {
  //   this.rollupModal.hide();
  // }

  showPumpModal() {
    this.showPsatModal.emit(true);
  }

  collapseSummary(str: string) {
    this.showSummary = str;
    setTimeout(() => {
      this.hideSummary.emit(true);
    },250)
  }
}