import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { ModalDirective } from 'ng2-bootstrap';
@Component({
  selector: 'app-assessment-menu',
  templateUrl: './assessment-menu.component.html',
  styleUrls: ['./assessment-menu.component.css']
})
export class AssessmentMenuComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('viewChange')
  viewChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  setView(view: string){
    this.viewChange.emit(view);
  }

}
