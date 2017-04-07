import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PSAT, PsatInputs } from '../../shared/models/psat';

@Component({
  selector: 'app-system-basics',
  templateUrl: './system-basics.component.html',
  styleUrls: ['./system-basics.component.css']
})
export class SystemBasicsComponent implements OnInit {
  @Input()
  psat:PSAT;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  saveClicked: boolean;
  @Input()
  isValid: boolean;
  constructor() { }

  ngOnInit() {
  }
}
