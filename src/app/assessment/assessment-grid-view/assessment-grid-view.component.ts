import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Directory } from '../../shared/models/directory';
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

}
