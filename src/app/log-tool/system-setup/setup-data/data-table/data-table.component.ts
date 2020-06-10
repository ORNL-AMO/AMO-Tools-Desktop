import { Component, OnInit } from '@angular/core';
import { LogToolService } from '../../../log-tool.service';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit {

  constructor(public logToolService: LogToolService) { }

  ngOnInit() {
  }

}
