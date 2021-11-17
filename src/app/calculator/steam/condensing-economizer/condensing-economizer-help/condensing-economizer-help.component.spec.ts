import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensingEconomizerHelpComponent } from './condensing-economizer-help.component';

describe('CondensingEconomizerHelpComponent', () => {
  let component: CondensingEconomizerHelpComponent;
  let fixture: ComponentFixture<CondensingEconomizerHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CondensingEconomizerHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CondensingEconomizerHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
