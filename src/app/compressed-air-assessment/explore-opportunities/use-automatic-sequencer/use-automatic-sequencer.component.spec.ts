import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UseAutomaticSequencerComponent } from './use-automatic-sequencer.component';

describe('UseAutomaticSequencerComponent', () => {
  let component: UseAutomaticSequencerComponent;
  let fixture: ComponentFixture<UseAutomaticSequencerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UseAutomaticSequencerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UseAutomaticSequencerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
