import { Subscription } from 'rxjs';
import { WaterProcessDiagramComponent } from './water-process-diagram.component';
import { WaterProcessDiagramService } from './water-process-diagram.service';
import { Diagram } from '../shared/models/diagram';

describe('WaterProcessDiagramComponent teardown', () => {
  it('clears the shared diagram state so the next diagram does not mount with this one\'s data', () => {
    const service = new WaterProcessDiagramService();
    const component = new WaterProcessDiagramComponent(service, null, null, null, null, null, null, null, null);
    component.mainTabSub = new Subscription();
    component.waterDiagramSub = new Subscription();
    component.modalOpenSub = new Subscription();

    const diagram = { waterDiagram: { flowDiagramData: {} } } as unknown as Diagram;
    service.diagram.next(diagram);
    service.updateWaterDiagram(diagram.waterDiagram);
    service.parentContainer.next({ height: 500, headerHeight: 0, footerHeight: 0 } as never);

    component.ngOnDestroy();

    expect(service.diagram.getValue()).toBeUndefined();
    expect(service.waterDiagram.getValue()).toBeUndefined();
    expect(service.parentContainer.getValue()).toBeUndefined();
  });
});
