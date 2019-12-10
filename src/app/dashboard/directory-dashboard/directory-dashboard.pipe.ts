import { Pipe, PipeTransform } from '@angular/core';
import { DirectoryItem, FilterDashboardBy } from '../../shared/models/directory-dashboard';
import { DirectoryDashboardService } from './directory-dashboard.service';

@Pipe({
  name: 'directoryDashboardFilter',
  pure: false
})
export class DirectoryDashboardPipe implements PipeTransform {

  constructor(private directoryDashboardService: DirectoryDashboardService) {
  }

  transform(directoryItems: Array<DirectoryItem>, sortBy: string, filterDashboard: FilterDashboardBy): Array<DirectoryItem> {
    directoryItems = this.directoryDashboardService.filterDirectoryItems(directoryItems, filterDashboard);
    return directoryItems;
  }

}
