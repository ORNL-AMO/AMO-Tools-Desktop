import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { FSAT } from '../../shared/models/fans';

@Component({
  selector: 'app-fsat-sankey',
  templateUrl: './fsat-sankey.component.html',
  styleUrls: ['./fsat-sankey.component.css']
})
export class FsatSankeyComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  location: string;
  @Input()
  printView: boolean;
  @Input()
  modIndex: number;
  @Input()
  assessmentName: string;
  @Input()
  isBaseline: boolean;

  @ViewChild('ngChart') ngChart: ElementRef;

  

  constructor() { }

  ngOnInit() {
  }

}
