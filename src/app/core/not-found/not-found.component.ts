import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImportExportService } from '../../shared/import-export/import-export.service';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.css'],
    standalone: false
})
export class NotFoundComponent implements OnInit {
  measurItemType: MeasurRoutingType = 'page';
  constructor(
    private activatedRoute: ActivatedRoute,
    private importExportService: ImportExportService,

    ) { }

  ngOnInit(): void {

      this.activatedRoute.queryParams.subscribe(qp => {
         if (qp['measurItemType']) {
          this.measurItemType = qp['measurItemType'];
         }
      });
  }

  ngOnDestroy() {
  }

  sendMail() {
    this.importExportService.openMailTo();
  }

}


export type MeasurRoutingType = 'page' | 'assessment' | 'inventory';