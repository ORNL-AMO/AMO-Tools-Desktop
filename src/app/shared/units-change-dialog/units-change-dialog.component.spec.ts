import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnitsChangeDialogComponent, UnitsChangeDialogData } from './units-change-dialog.component';

describe('UnitsChangeDialogComponent', () => {
  let fixture: ComponentFixture<UnitsChangeDialogComponent>;
  let dialogRef: jasmine.SpyObj<DialogRef>;

  beforeEach(() => {
    dialogRef = jasmine.createSpyObj<DialogRef>('DialogRef', ['close']);
    const data: UnitsChangeDialogData = { fromUnits: 'Imperial', toUnits: 'Metric' };
    TestBed.configureTestingModule({
      imports: [UnitsChangeDialogComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: data },
      ],
    });
    fixture = TestBed.createComponent(UnitsChangeDialogComponent);
    fixture.detectChanges();
  });

  function click(selector: string, index = 0): void {
    fixture.nativeElement.querySelectorAll(selector)[index].click();
  }

  it('names the current and new unit systems', () => {
    expect(fixture.nativeElement.querySelector('.modal-title').textContent).toMatch(/Imperial.*Metric/s);
  });

  it('closes with convert when Convert data is chosen', () => {
    expect(fixture.nativeElement.querySelector('.modal-body .btn-primary').textContent).toContain('Convert data to Metric');
    click('.modal-body .btn-primary');

    expect(dialogRef.close).toHaveBeenCalledWith('convert');
  });

  it('closes with relabel when Change labels only is chosen', () => {
    click('.modal-body .btn-primary', 1);

    expect(dialogRef.close).toHaveBeenCalledWith('relabel');
  });

  it('closes with no result when cancelled', () => {
    click('.modal-footer .btn-white');
    click('.modal-header .close');

    expect(dialogRef.close.calls.allArgs()).toEqual([[undefined], [undefined]]);
  });
});
