import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-other-losses-help',
    templateUrl: './other-losses-help.component.html',
    styleUrls: ['./other-losses-help.component.css'],
    standalone: false
})
export class OtherLossesHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
