import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap';

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
 // @ViewChild('rollupModal') public rollupModal: ModalDirective;
  constructor() { }

  ngOnInit() {
  }


  showFurnaceRollup(){
    this.showModal.emit(true);
  }
  // showModal() {
  //     this.rollupModal.show();
  // }

  // hideModal() {
  //   this.rollupModal.hide();
  // }

  showPumpModal(){
    this.showPsatModal.emit(true);
  }
}
