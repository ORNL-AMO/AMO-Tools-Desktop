import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-motor-drive-help',
    templateUrl: './motor-drive-help.component.html',
    styleUrls: ['./motor-drive-help.component.css'],
    standalone: false
})
export class MotorDriveHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
