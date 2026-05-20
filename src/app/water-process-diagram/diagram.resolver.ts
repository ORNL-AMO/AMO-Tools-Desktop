import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Diagram } from '../shared/models/diagram';

export const diagramResolver: ResolveFn<Diagram> = (route) => {
  const assessmentDiagramId = route.paramMap.get('diagramId');
  const diagramId = route.paramMap.get('id');
  const id = parseInt(assessmentDiagramId ?? diagramId, 10);
  return inject(DiagramIdbService).getByIdAsync(id);
};
