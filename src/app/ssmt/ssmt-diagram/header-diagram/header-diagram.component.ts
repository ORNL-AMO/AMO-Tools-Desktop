import { Component, OnInit, Input } from '@angular/core';
import { HeaderOutputObj } from '../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-header-diagram',
  templateUrl: './header-diagram.component.html',
  styleUrls: ['./header-diagram.component.css']
})
export class HeaderDiagramComponent implements OnInit {
  @Input()
  header: HeaderOutputObj;
  @Input()
  pressureLevel: string;

  constructor() { }

  ngOnInit() {
  }

}
