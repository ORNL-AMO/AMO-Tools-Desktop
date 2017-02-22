import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';

@Component({
  selector: 'app-baseline',
  templateUrl: './baseline.component.html',
  styleUrls: ['./baseline.component.css']
})
export class BaselineComponent implements OnInit {
  @Input()
  baseline: PSAT;
  constructor() { }

  ngOnInit() {
  }

}
