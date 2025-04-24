import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-fsat-basics-help',
    templateUrl: './fsat-basics-help.component.html',
    styleUrls: ['./fsat-basics-help.component.css'],
    standalone: false
})
export class FsatBasicsHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
