import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-replace-rewind-help',
  templateUrl: './replace-rewind-help.component.html',
  styleUrls: ['./replace-rewind-help.component.css']
})
export class ReplaceRewindHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
