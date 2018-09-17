import { Component, OnInit, Input } from '@angular/core';
import { SSMT } from '../../shared/models/ssmt';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class OperationsComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit() {
  }

}
