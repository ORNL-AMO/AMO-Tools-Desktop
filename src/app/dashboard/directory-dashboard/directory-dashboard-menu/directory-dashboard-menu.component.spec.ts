import { DirectoryDashboardMenuComponent } from './directory-dashboard-menu.component';
import { Directory } from '../../../shared/models/directory';
import { Diagram } from '../../../shared/models/diagram';

describe('DirectoryDashboardMenuComponent', () => {
  let component: DirectoryDashboardMenuComponent;

  beforeEach(() => {
    component = new DirectoryDashboardMenuComponent(
      null as any, null as any, null as any, null as any,
      null as any, null as any, null as any, null as any
    );
    component.directory = {
      name: 'test',
      assessments: [],
      subDirectory: [],
      calculators: [],
      inventories: [],
      diagrams: []
    } as Directory;
  });

  it('sets selected status when a diagram is selected', () => {
    component.directory.diagrams = [{
      type: 'Water',
      name: 'Water Diagram',
      selected: true
    } as Diagram];

    component.setSelectedStatus();

    expect(component.hasSelectedItem).toBeTrue();
    expect(component.canCopyItem).toBeTrue();
  });

  it('toggleSelectAll sets selected state on diagrams', () => {
    component.directory.diagrams = [{
      type: 'Water',
      name: 'Water Diagram',
      selected: false
    } as Diagram];
    component.isAllSelected = true;

    component.toggleSelectAll();

    expect(component.directory.diagrams[0].selected).toBeTrue();
  });
});
