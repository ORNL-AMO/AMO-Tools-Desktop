import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header-help',
  templateUrl: './header-help.component.html',
  styleUrls: ['./header-help.component.css']
})
export class HeaderHelpComponent implements OnInit {
  @Input()
  currentField: string;

  constructor() { }

  ngOnInit() {
  }

}
