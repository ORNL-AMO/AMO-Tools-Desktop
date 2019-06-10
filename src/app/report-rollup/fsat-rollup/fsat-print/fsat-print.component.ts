import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-fsat-print',
  templateUrl: './fsat-print.component.html',
  styleUrls: ['./fsat-print.component.css']
})
export class FsatPrintComponent implements OnInit {
  @Input()
  settings: Settings;
  
  constructor() { }

  ngOnInit() {
  }

}
