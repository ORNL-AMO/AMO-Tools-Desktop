import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamReductionFormComponent } from './steam-reduction-form.component';

describe('SteamReductionFormComponent', () => {
  let component: SteamReductionFormComponent;
  let fixture: ComponentFixture<SteamReductionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamReductionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamReductionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
