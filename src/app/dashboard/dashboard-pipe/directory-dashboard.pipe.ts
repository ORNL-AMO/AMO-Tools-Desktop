import { Pipe, PipeTransform } from '@angular/core';
import { DirectoryItem, FilterDashboardBy } from '../../shared/models/directory-dashboard';
import { DirectoryDashboardService } from '../directory-dashboard/directory-dashboard.service';

@Pipe({
    name: 'directoryDashboardFilter',
    pure: false,
    standalone: false
})
export class DirectoryDashboardPipe implements PipeTransform {

  constructor(private directoryDashboardService: DirectoryDashboardService) {
  }

  transform(directoryItems: Array<DirectoryItem>, sortBy: {value: string, direction: string}, filterDashboard: FilterDashboardBy): Array<DirectoryItem> {
    directoryItems = this.directoryDashboardService.filterDirectoryItems(directoryItems, filterDashboard);
    directoryItems = this.directoryDashboardService.sortDirectoryItems(directoryItems, sortBy);
    return directoryItems;
  }

}
