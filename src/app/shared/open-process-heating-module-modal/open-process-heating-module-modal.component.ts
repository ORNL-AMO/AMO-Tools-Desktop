import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

export interface OpenProcessHeatingModuleModalData {
  onSelect: (phastModuleOverride: 'phast' | 'process-heating') => void;
}

@Component({
  selector: 'app-open-process-heating-module-modal',
  standalone: true,
  templateUrl: './open-process-heating-module-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenProcessHeatingModuleModalComponent {
  private readonly dialogRef = inject(DialogRef<void, OpenProcessHeatingModuleModalComponent>);
  protected readonly data = inject<OpenProcessHeatingModuleModalData>(DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }

  select(phastModuleOverride: 'phast' | 'process-heating'): void {
    this.data.onSelect(phastModuleOverride);
    this.close();
  }
}
