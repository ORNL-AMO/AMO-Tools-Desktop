import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-fsat-fluid-help',
    templateUrl: './fsat-fluid-help.component.html',
    styleUrls: ['./fsat-fluid-help.component.css'],
    standalone: false
})
export class FsatFluidHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
