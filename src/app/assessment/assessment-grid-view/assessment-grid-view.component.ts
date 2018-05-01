import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Calculator } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';
@Component({
  selector: 'app-assessment-grid-view',
  templateUrl: './assessment-grid-view.component.html',
  styleUrls: ['./assessment-grid-view.component.css']
})
export class AssessmentGridViewComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Input()
  isChecked: boolean;
  @Output('emitPreAssessment')
  emitPreAssessment = new EventEmitter<boolean>();
  @Input()
  directorySettings: Settings;
  constructor() { }

  ngOnInit() {
  }

  changeDirectory(dir?) {
    if (dir) {
      this.directoryChange.emit(dir);
    } else {
      this.directoryChange.emit(this.directory);
    }
  }

  viewPreAssessment(exists: boolean) {
    this.emitPreAssessment.emit(exists);
  }
}
