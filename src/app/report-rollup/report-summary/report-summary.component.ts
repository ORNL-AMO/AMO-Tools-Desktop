import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';
import { PhastResultsData } from '../report-rollup.service';

@Component({
  selector: 'app-report-summary',
  templateUrl: './report-summary.component.html',
  styleUrls: ['./report-summary.component.css']
})
export class ReportSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('showPhastModal')
  showPhastModal = new EventEmitter<boolean>();
  @Output('showPsatModal')
  showPsatModal = new EventEmitter<boolean>();
  @Output('showFsatModal')
  showFsatModal = new EventEmitter<boolean>();
  @Input()
  phastResults: Array<PhastResultsData>;
  @Input()
  numPhasts: number;
  @Input()
  numPsats: number;
  @Input()
  numFsats: number;


  @Output('hideSummary')
  hideSummary = new EventEmitter<boolean>();
  // @ViewChild('rollupModal') public rollupModal: ModalDirective;
  showSummary: string = 'open';
  constructor() { }

  ngOnInit() {
  }


  showFurnaceRollup() {
    this.showPhastModal.emit(true);
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

  showFanModal(){
    this.showFsatModal.emit(true);
  }

  collapseSummary(str: string) {
    this.showSummary = str;
    setTimeout(() => {
      this.hideSummary.emit(true);
    },250)
  }
}