import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamReductionHelpComponent } from './steam-reduction-help.component';

describe('SteamReductionHelpComponent', () => {
  let component: SteamReductionHelpComponent;
  let fixture: ComponentFixture<SteamReductionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamReductionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
