import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { actionPayloadConstructor } from '@nx-ng-starter/client-util';

import {
  HTTP_PROGRESS_STATE,
  httpProgressInitialState,
  IAppHttpProgressState,
  THttpProgressPayload,
} from './http-progress.interface';

const createAction = actionPayloadConstructor(HTTP_PROGRESS_STATE.getName());
const startProgress = createAction<THttpProgressPayload>('start');
const stopProgress = createAction<THttpProgressPayload>('stop');

export const httpProgressActions = {
  startProgress,
  stopProgress,
};

@State<IAppHttpProgressState>({
  name: HTTP_PROGRESS_STATE,
  defaults: {
    ...httpProgressInitialState,
  },
})
@Injectable({
  providedIn: 'root',
})
export class AppHttpProgressState {
  @Selector()
  public static allProgress(state: IAppHttpProgressState) {
    return state;
  }

  @Selector()
  public static mainViewProgress(state: IAppHttpProgressState) {
    return state.mainView;
  }

  @Action(startProgress)
  public startProgress(
    ctx: StateContext<IAppHttpProgressState>,
    { payload }: THttpProgressPayload,
  ) {
    return ctx.patchState(payload);
  }

  @Action(stopProgress)
  public stopProgress(ctx: StateContext<IAppHttpProgressState>, { payload }: THttpProgressPayload) {
    return ctx.patchState(payload);
  }
}
