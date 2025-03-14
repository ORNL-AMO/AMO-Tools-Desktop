import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistingCompressorModalComponent } from './existing-compressor-modal.component';

describe('ExistingCompressorModalComponent', () => {
  let component: ExistingCompressorModalComponent;
  let fixture: ComponentFixture<ExistingCompressorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExistingCompressorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExistingCompressorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
