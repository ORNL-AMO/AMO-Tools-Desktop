import { Component, OnInit, Input, ChangeDetectorRef, ViewChild, ElementRef, inject, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../../shared/feature-flag.service';
import { Settings } from '../../../../shared/models/settings';
import { FSAT, FsatOperations } from '../../../../shared/models/fans';


@Component({
    selector: 'app-system-info-summary',
    templateUrl: './system-info-summary.component.html',
    styleUrls: ['./system-info-summary.component.css'],
    standalone: false
})
export class SystemInfoSummaryComponent implements OnInit {
    private featureFlagService = inject(FeatureFlagService);

    @Input()
    printView: boolean;
    @Input()
    settings: Settings;


    showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;
    @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
    copyTableString: any;
     
    collapse: boolean = true;


    constructor(private cd: ChangeDetectorRef) { }

    ngOnInit() {

    }

    toggleCollapse() {
        this.collapse = !this.collapse;
    }
}