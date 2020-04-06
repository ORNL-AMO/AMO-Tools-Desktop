import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntRollupPrintComponent } from './treasure-hunt-rollup-print.component';

describe('TreasureHuntRollupPrintComponent', () => {
  let component: TreasureHuntRollupPrintComponent;
  let fixture: ComponentFixture<TreasureHuntRollupPrintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntRollupPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntRollupPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
