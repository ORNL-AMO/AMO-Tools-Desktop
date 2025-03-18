import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-replace-existing-help',
    templateUrl: './replace-existing-help.component.html',
    styleUrls: ['./replace-existing-help.component.css'],
    standalone: false
})
export class ReplaceExistingHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
