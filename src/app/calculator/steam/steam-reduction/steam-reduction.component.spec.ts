import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamReductionComponent } from './steam-reduction.component';

describe('SteamReductionComponent', () => {
  let component: SteamReductionComponent;
  let fixture: ComponentFixture<SteamReductionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamReductionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamReductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
