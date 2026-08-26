import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormsModule } from '@angular/forms';

export const DEFAULT_DESCRIPTION = 'Explore Opportunities and Expert View let you model modifications to your baseline conditions. Data will be copied from your current baseline.';

export interface AddModificationData {
  themeClass: string;
  description?: string;
  defaultName: string;
  onCreate: (name: string) => void;
}

@Component({
  selector: 'app-add-modification',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-modification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddModificationComponent {
  private readonly dialogRef = inject(DialogRef<void, AddModificationComponent>);
  protected readonly data = inject<AddModificationData>(DIALOG_DATA);

  protected readonly description = this.data.description ?? DEFAULT_DESCRIPTION;
  newModificationName = this.data.defaultName;

  close(): void {
    this.dialogRef.close();
  }

  createModification(): void {
    if (!this.newModificationName) return;
    this.data.onCreate(this.newModificationName);
    this.close();
  }
}
