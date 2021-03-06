import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { actionPayloadConstructor } from '@nx-ng-starter/client-util';

import { IUserState, TUserPayload, USER_STATE, userInitialState } from './user.interface';
import { AppUserService } from './user.service';

const createAction = actionPayloadConstructor(USER_STATE.getName());
const setState = createAction<TUserPayload>('set state');

export const userActions = {
  setState,
};

@State<IUserState>({
  name: USER_STATE,
  defaults: {
    ...userInitialState,
  },
})
@Injectable({
  providedIn: 'root',
})
export class AppUserState {
  constructor(private readonly store: Store, private readonly api: AppUserService) {
    const user = this.api.restoreUser();
    void this.store.dispatch(new userActions.setState(user)).subscribe();
  }

  @Selector()
  public static model(state: IUserState) {
    return state;
  }

  @Selector()
  public static email(state: IUserState) {
    return state.email;
  }

  @Selector()
  public static token(state: IUserState) {
    return state.token;
  }

  @Selector()
  public static admin(state: IUserState) {
    return state.admin;
  }

  @Action(setState)
  public setState(ctx: StateContext<IUserState>, { payload }: TUserPayload) {
    const currentState: IUserState = ctx.getState();
    const email = typeof payload.email !== 'undefined' ? payload.email : currentState.email;
    const admin = typeof payload.admin === 'boolean' ? payload.admin : currentState.admin;
    const token = typeof payload.token !== 'undefined' ? payload.token : currentState.token;
    const newState: IUserState = { email, admin, token };
    this.api.saveUser(newState);
    return ctx.patchState(newState);
  }
}
