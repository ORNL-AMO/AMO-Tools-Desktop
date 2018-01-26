import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-report-graphs-print',
    templateUrl: './report-graphs-print.component.html',
    styleUrls: ['./report-graphs-print.component.css']
})
export class ReportGraphsPrintComponent implements OnInit {

    constructor() { }

    ngOnInit() { 
        console.log('I INITIALIZED')
    }
}