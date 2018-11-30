import { Component, OnInit, Input } from '@angular/core';
import { HeaderOutputObj } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-header-table',
  templateUrl: './header-table.component.html',
  styleUrls: ['./header-table.component.css']
})
export class HeaderTableComponent implements OnInit {
  @Input()
  header: HeaderOutputObj;
  @Input()
  name: string;

  constructor() { }

  ngOnInit() {
    console.log(this.name);
    console.log(this.header);
  }

}
