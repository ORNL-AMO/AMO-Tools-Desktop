import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericCompressorModalComponent } from './generic-compressor-modal.component';

describe('GenericCompressorModalComponent', () => {
  let component: GenericCompressorModalComponent;
  let fixture: ComponentFixture<GenericCompressorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericCompressorModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericCompressorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
