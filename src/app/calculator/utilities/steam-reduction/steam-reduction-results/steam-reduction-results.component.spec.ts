import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamReductionResultsComponent } from './steam-reduction-results.component';

describe('SteamReductionResultsComponent', () => {
  let component: SteamReductionResultsComponent;
  let fixture: ComponentFixture<SteamReductionResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamReductionResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamReductionResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
