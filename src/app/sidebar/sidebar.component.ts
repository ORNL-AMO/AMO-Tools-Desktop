import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { Directory } from '../shared/models/directory';
import { Assessment } from '../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../assessment/assessment.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Output('selectCalculator')
  selectCalculator = new EventEmitter<string>();
  @Input()
  directory: Directory;
  @Input()
  workingDirectory: Directory;
  @Output('showSettings')
  showSettings = new EventEmitter<boolean>();

  selectedDirectory: Directory;
  firstChange: boolean = true;
  constructor() { }

  ngOnInit() {
    this.selectedDirectory = this.directory;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.directory && !this.firstChange) {
      this.toggleSelected(this.workingDirectory);
    }
    if (this.firstChange) {
      this.firstChange = false;
    }
  }

  toggleDirectoryCollapse(dir: Directory) {
    dir.collapsed = !dir.collapsed;
  }

  toggleSelected(dir: Directory) {
    if (dir.collapsed == true) {
      dir.collapsed = false;
    }
    this.selectedDirectory = dir;
    this.directoryChange.emit(dir);
  }

  chooseCalculator(str: string) {
    this.selectCalculator.emit(str);
  }

  emitShowSettings(){
    this.showSettings.emit(true)
  }
}
