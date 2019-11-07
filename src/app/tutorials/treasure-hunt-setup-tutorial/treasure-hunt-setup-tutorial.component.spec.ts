import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntSetupTutorialComponent } from './treasure-hunt-setup-tutorial.component';

describe('TreasureHuntSetupTutorialComponent', () => {
  let component: TreasureHuntSetupTutorialComponent;
  let fixture: ComponentFixture<TreasureHuntSetupTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntSetupTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntSetupTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
