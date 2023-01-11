import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceCompressorModalComponent } from './replace-compressor-modal.component';

describe('ReplaceCompressorModalComponent', () => {
  let component: ReplaceCompressorModalComponent;
  let fixture: ComponentFixture<ReplaceCompressorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplaceCompressorModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplaceCompressorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
