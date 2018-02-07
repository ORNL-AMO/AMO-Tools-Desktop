import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

import { MockDirectory } from '../../shared/mocks/mock-directory';
import { Directory } from '../../shared/models/directory';

@Component({
  selector: 'app-assessment-dashboard',
  templateUrl: './assessment-dashboard.component.html',
  styleUrls: ['./assessment-dashboard.component.css']
})
export class AssessmentDashboardComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Output('deleteDataSignal')
  deleteDataSignal = new EventEmitter<boolean>();
  @Output('deleteCheckedItems')
  deleteCheckedItems = new EventEmitter<boolean>();
  @Output('resetDataEmit')
  resetDataEmit = new EventEmitter<boolean>();
  @Output('emitNewDir')
  emitNewDir = new EventEmitter<boolean>();
  @Output('genReport')
  genReport = new EventEmitter<boolean>();
  @Output('exportEmit')
  exportEmit = new EventEmitter<boolean>();
  @Output('importEmit')
  importEmit = new EventEmitter<boolean>();

  isChecked: boolean = false;
  view: string;
  isFirstChange: boolean = true;

  constructor() { }

  ngOnInit() {
    if (!this.view) {
      this.view = 'grid';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.directory && !this.isFirstChange) {
      this.view == 'grid';
    }

    if (this.isFirstChange) {
      this.isFirstChange = false;
    }
  }
  changeView($event) {
    if (this.view == $event && this.view == 'settings') {
      this.view = 'grid';
    } else {
      this.view = $event;
    }
  }

  changeDirectory($event) {
    if (this.view == 'settings') {
      this.view = 'grid';
    }
    this.directoryChange.emit($event);
  }

  signalDelete() {
    this.deleteDataSignal.emit(true);
  }

  signalDeleteItems() {
    this.deleteCheckedItems.emit(true);
  }

  resetData() {
    this.resetDataEmit.emit(true);
  }

  selectAllItems(bool: boolean) {
    this.isChecked = bool;
  }

  newDir(){
    this.emitNewDir.emit(true);
  }

  emitGenReport(){
    this.genReport.emit(true);
  }

  emitExport(){
    this.exportEmit.emit(true);
  }

  emitImport(){
    this.importEmit.emit(true);
  }
}
