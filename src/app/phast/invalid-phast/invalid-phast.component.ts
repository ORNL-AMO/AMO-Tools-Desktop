import { Component, OnInit, Input } from '@angular/core';
import { PhastValid } from '../../shared/models/phast/phast';

@Component({
    selector: 'app-invalid-phast',
    templateUrl: './invalid-phast.component.html',
    styleUrls: ['./invalid-phast.component.css'],
    standalone: false
})
export class InvalidPhastComponent implements OnInit {

  @Input() phastValid: PhastValid;
  constructor() { }

  ngOnInit(): void {
  }

}
