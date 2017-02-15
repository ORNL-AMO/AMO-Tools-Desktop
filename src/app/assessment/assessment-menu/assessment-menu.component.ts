import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Directory } from '../../shared/models/directory';

@Component({
  selector: 'app-assessment-menu',
  templateUrl: './assessment-menu.component.html',
  styleUrls: ['./assessment-menu.component.css']
})
export class AssessmentMenuComponent implements OnInit {
  @Output('viewChange')
  viewChange = new EventEmitter();
  
  constructor() { }

  ngOnInit() {
  }

  setView(view: string){
    this.viewChange.emit(view);
  }

}
