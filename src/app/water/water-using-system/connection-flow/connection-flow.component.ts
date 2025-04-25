import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ComponentFlowType, EdgeFlowData, getIsValidEdgeId, getNewEdgeId } from 'process-flow-lib';

@Component({
  selector: 'app-connection-flow',
  standalone: false,
  templateUrl: './connection-flow.component.html',
  styleUrl: './connection-flow.component.css'
})
export class ConnectionFlowComponent implements OnChanges {
  @Input()
  edgeFlowData: EdgeFlowData;
  @Input()
  flowType: ComponentFlowType;
  @Input()
  settings: Settings;
  @Input()
  connectionOptions: { value: string, display: string }[] = []

  @Output('updateFlow')
  updateFlow = new EventEmitter<EdgeFlowData>();
  form: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnChanges() {
    let selectedConnection = this.connectionOptions.find(option => {
      let relatedId = this.flowType === 'sourceWater' ? this.edgeFlowData.source : this.edgeFlowData.target;
      return option.value == relatedId;
    });

    this.form = this.fb.group({
      selectedConnection: [selectedConnection.value],
      flowValue: [this.edgeFlowData.flowValue, [Validators.required, Validators.min(0)]],
    });
  }

  updateFlowData() {
    let updatedEdgeFlowData: EdgeFlowData = {
      ...this.edgeFlowData,
      flowValue: this.form.controls.flowValue.value,
    };
    
    if (this.flowType === 'sourceWater') {
      updatedEdgeFlowData.source = this.form.controls.selectedConnection.value;
    } else {
      updatedEdgeFlowData.target = this.form.controls.selectedConnection.value;
    }

    // todo e2 or should all edgeId creation happen here?
    if (!getIsValidEdgeId(updatedEdgeFlowData.diagramEdgeId, updatedEdgeFlowData.source, updatedEdgeFlowData.target)) {
      debugger;
      console.log('invalidEdge: creating new edge id', updatedEdgeFlowData.source, updatedEdgeFlowData.target);
      updatedEdgeFlowData.diagramEdgeId = getNewEdgeId(updatedEdgeFlowData.source, updatedEdgeFlowData.target);
    }
    
    if (updatedEdgeFlowData.source && updatedEdgeFlowData.target) {
      console.log('updatedEdgeFlowData', updatedEdgeFlowData);
      this.updateFlow.emit(updatedEdgeFlowData);
    }
  }

}
