import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EdgeFlowData } from '../../../shared/models/water-assessment';

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
  settings: Settings;
  @Input()
  connectionOptions: { value: string, display: string }[] = []

  @Output('updateFlow')
  updateFlow = new EventEmitter<EdgeFlowData>();
  form: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnChanges() {
    let selectedConnection = this.connectionOptions.find(option => {
      return option.value == this.edgeFlowData.source
    });

    this.form = this.fb.group({
      selectedConnection: [selectedConnection.value],
      flowValue: [this.edgeFlowData.flowValue, [Validators.required, Validators.min(0)]],
    });
  }

  updateFlowData() {
    const updatedEdgeFlowData: EdgeFlowData = {
      ...this.edgeFlowData,
      source: this.form.controls.selectedConnection.value,
      flowValue: this.form.controls.flowValue.value,
    };

    
    if (updatedEdgeFlowData.source !== undefined) {
      this.updateFlow.emit(updatedEdgeFlowData);
    }
  }

}
