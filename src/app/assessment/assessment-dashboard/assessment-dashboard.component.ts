import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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

  view: string = 'list';
  isSettingsView: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  changeView($event) {
    this.view = $event;
  }

  viewSettings() {
    this.isSettingsView = !this.isSettingsView;
  }

  changeDirectory($event) {
    this.directoryChange.emit($event);
  }

}
