import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-delay-method-help',
    templateUrl: './delay-method-help.component.html',
    styleUrls: ['./delay-method-help.component.css'],
    standalone: false
})
export class DelayMethodHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
