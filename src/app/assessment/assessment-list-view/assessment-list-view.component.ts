import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { Calculator } from '../../shared/models/calculators';

@Component({
  selector: 'app-assessment-list-view',
  templateUrl: './assessment-list-view.component.html',
  styleUrls: ['./assessment-list-view.component.css']
})
export class AssessmentListViewComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Input()
  isChecked: boolean;
  @Input()
  directoryCalculator: Calculator;
  @Output('emitPreAssessment')
  emitPreAssessment = new EventEmitter<number>();
  constructor() { }

  ngOnInit() {
  }

  changeDirectory(dir?) {
    if(dir){
      this.directoryChange.emit(dir);
    }else{
      this.directoryChange.emit(this.directory);
    }
  }

  viewPreAssessment(index: number) {
    this.emitPreAssessment.emit(index);
  }

}
