import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-wall-losses-surface-help',
    templateUrl: './wall-losses-surface-help.component.html',
    styleUrls: ['./wall-losses-surface-help.component.css'],
    standalone: false
})
export class WallLossesSurfaceHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
