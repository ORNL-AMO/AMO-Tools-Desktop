import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceCompressorHelpComponent } from './replace-compressor-help.component';

describe('ReplaceCompressorHelpComponent', () => {
  let component: ReplaceCompressorHelpComponent;
  let fixture: ComponentFixture<ReplaceCompressorHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplaceCompressorHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplaceCompressorHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
