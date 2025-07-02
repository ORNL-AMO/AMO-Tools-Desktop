import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportToJustifiModalComponent } from './export-to-justifi-modal.component';

describe('ExportToJustifiModalComponent', () => {
  let component: ExportToJustifiModalComponent;
  let fixture: ComponentFixture<ExportToJustifiModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportToJustifiModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportToJustifiModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
