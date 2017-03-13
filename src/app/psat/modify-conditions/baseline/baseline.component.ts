import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-baseline',
  templateUrl: './baseline.component.html',
  styleUrls: ['./baseline.component.css']
})
export class BaselineComponent implements OnInit {
  @Input()
  baseline: PSAT;
  @Output('baselineSelect')
  baselineSelect = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  selectBaseline(){
    this.baselineSelect.emit('baseline');
  }

}
