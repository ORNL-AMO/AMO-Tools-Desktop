import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../shared/models/phast/phast';

@Component({
  selector: 'app-modification-navbar',
  templateUrl: './modification-navbar.component.html',
  styleUrls: ['./modification-navbar.component.css']
})
export class ModificationNavbarComponent implements OnInit {
  @Input()
  phast: PHAST;
  constructor() { }

  ngOnInit() {
  }

}
