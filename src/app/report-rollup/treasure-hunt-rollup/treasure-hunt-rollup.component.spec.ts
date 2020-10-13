import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntRollupComponent } from './treasure-hunt-rollup.component';

describe('TreasureHuntRollupComponent', () => {
  let component: TreasureHuntRollupComponent;
  let fixture: ComponentFixture<TreasureHuntRollupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntRollupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntRollupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
