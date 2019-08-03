import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Mocked material dialog.
 */
@Injectable()
export class DialogRefMock {
  public close(
    event: { action: string; data: any } = { action: 'close', data: {} }
  ): boolean {
    this.afterClosedSubject.next(event);
    this.afterClosedSubject.complete();
    return true;
  }

  public hide(event?: { action: string; data: any }): boolean {
    return true;
  }

  public updateSize(width?: string, height?: string): boolean {
    return true;
  }

  private afterClosedSubject: Subject<any> = new Subject();

  public afterClosed(): Subject<any> {
    return this.afterClosedSubject;
  }
}