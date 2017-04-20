import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-assessment-settings',
  templateUrl: './assessment-settings.component.html',
  styleUrls: ['./assessment-settings.component.css']
})
export class AssessmentSettingsComponent implements OnInit {
  @Output('deleteData')
  deleteData = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

  signalDelete() {
    this.deleteData.emit(true);
  }

}
