import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApolloLink, split } from '@apollo/client/core';
import { ErrorResponse, onError } from '@apollo/client/link/error';
import { getMainDefinition } from '@apollo/client/utilities';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { AppToasterService } from '@nx-ng-starter/client-services';
import {
  HTTP_STATUS,
  IWebClientAppEnvironment,
  WEB_CLIENT_APP_ENV,
  WINDOW,
} from '@nx-ng-starter/client-util';
import { HttpLink, HttpLinkHandler } from 'apollo-angular/http';
import { createUploadLink } from 'apollo-upload-client';
import { ExecutionResult, GraphQLError } from 'graphql';
import memo from 'memo-decorator';
import { MonoTypeOperatorFunction, Observable, throwError } from 'rxjs';
import { catchError, first, map, take, tap, timeout } from 'rxjs/operators';

import { AppHttpProgressService } from '../http-progress/http-progress.service';
import { AppUserState } from '../user';
import { userActions } from '../user/user.store';

/**
 * Http handers service.
 */
@Injectable({
  providedIn: 'root',
})
export class AppHttpHandlersService {
  /**
   * Default timeout interval for http-requests.
   */
  public readonly defaultHttpTimeout = 10000;

  public readonly userToken$: Observable<string> = this.store.select(AppUserState.token);

  constructor(
    public readonly store: Store,
    public readonly toaster: AppToasterService,
    public readonly httpLink: HttpLink,
    public readonly httpProgress: AppHttpProgressService,
    public readonly translate: TranslateService,
    @Inject(WINDOW) public readonly win: Window,
    @Inject(WEB_CLIENT_APP_ENV) public readonly env: IWebClientAppEnvironment,
  ) {}

  /**
   * Resolves if app is running on localhost.
   */
  public isLocalhost(): boolean {
    return this.win.location.origin.includes('localhost');
  }

  /**
   * Resolver graphQL base url, adds correct protocol.
   */
  public graphQlEndpoint(): string {
    const url = `${this.env.api}/graphql`;
    return url;
  }

  /**
   * Returns new http headers for GraphQL.
   */
  public getGraphQLHttpHeaders() {
    return this.userToken$.pipe(
      first(),
      map(token => {
        return new HttpHeaders({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Token ${token}`,
        });
      }),
    );
  }

  /**
   * Returns API base url concatenated with provided endpoint path.
   * Adds preceding slash before endpoint path if it is missing.
   * @param path endpoint path
   */
  @memo()
  public getEndpoint(path: string): string {
    const p = /^\/.*$/.test(path) ? path : `/${path}`;
    return this.env.api + p;
  }

  /**
   * Pipes request with object response.
   * @param observable request observable
   * @param listenX number of responses to catch
   */
  public pipeHttpResponse<T>(observable: Observable<T>, listenX = 1) {
    return observable.pipe(
      timeout(this.defaultHttpTimeout),
      this.tapProgress<T>(true),
      take(listenX),
      catchError(err => this.handleError(err)),
    );
  }

  /**
   * Pipes graphQL request response.
   * @param observable request observable
   * @param listenX number of responses to catch
   * @param withprogress should request start progress
   */
  public pipeGraphQLRequest<T>(observable: Observable<T>, listenX = 1, withprogress = true) {
    return observable.pipe(
      timeout(this.defaultHttpTimeout),
      this.tapProgress<T>(withprogress),
      take(listenX),
      this.tapError<T>(),
      catchError(err => this.handleGraphQLError(err)),
    );
  }

  private getGraphqlNetworkLink(httpLinkHandler: HttpLinkHandler, uri: string) {
    return this.userToken$.pipe(
      first(),
      map(token => {
        return split(
          ({ query }) => {
            const { name } = getMainDefinition(query);
            return !Boolean(name);
          },
          httpLinkHandler,
          (createUploadLink({
            uri,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { Authorization: `Token ${token}` },
          }) as unknown) as ApolloLink,
        );
      }),
    );
  }

  private getErroLinkHandler(errorLinkHandler?: ApolloLink) {
    const linkHandler =
      typeof errorLinkHandler !== 'undefined'
        ? errorLinkHandler
        : onError((error: ErrorResponse) => {
            let resultMessage = '';
            /**
             * Error code in uppercase, e.g. ACCESS_FORBIDDEN.
             * Should be used as a translate service dictionary key
             * to retrieve a localized substring for UI display.
             * Only last error code is translated and displayed in UI.
             */
            let errorCode = '';
            let errorCodeUITranslation = '';

            const { graphQLErrors, networkError } = error;

            if (typeof graphQLErrors !== 'undefined') {
              // eslint-disable-next-line no-console
              console.error('Apollo linkHandler [GraphQL error]: ', graphQLErrors);
              graphQLErrors.map(({ message, extensions }) => {
                resultMessage += `[GraphQL]: ${message}`;
                errorCode = extensions?.code;
              });
            }

            if (Boolean(networkError)) {
              // eslint-disable-next-line no-console
              console.error('Apollo linkHandler [Network error]: ', networkError);

              if (networkError instanceof HttpErrorResponse) {
                resultMessage += (networkError.error as { detail: string }).detail;
              } else {
                const errors: GraphQLError[] = ((networkError as unknown) as {
                  error: {
                    errors: GraphQLError[];
                  };
                }).error.errors;
                errors.map(({ message, extensions }) => {
                  resultMessage += `[Network]: ${message}`;
                  errorCode = extensions?.code;
                });
              }
            }

            if (errorCode) {
              errorCodeUITranslation = this.translate.instant(`request.error.${errorCode}`);
              if (!errorCodeUITranslation.includes(errorCode)) {
                resultMessage = errorCodeUITranslation;
              }
            }

            if (!resultMessage) {
              resultMessage = 'Graphql request error';
            }

            this.toaster.showToaster(resultMessage, 'error');
          });
    return linkHandler;
  }

  /**
   * Creates apollo link with error handler.
   * @param errorLinkHandler custom error handler
   */
  public createApolloLinkFor(errorLinkHandler?: ApolloLink) {
    const uri = this.graphQlEndpoint();
    const httpLinkHandler = this.httpLink.create({ uri });
    const linkHandler: ApolloLink = this.getErroLinkHandler(errorLinkHandler);
    const networkLinkObs = this.getGraphqlNetworkLink(httpLinkHandler, uri);
    return networkLinkObs.pipe(map(networkLink => linkHandler.concat(networkLink)));
  }

  /**
   * Extracts GraphQL data.
   * Returns data only, excluding meta information located in response object root.
   * @param res Execution result
   */
  public extractGraphQLData(res: ExecutionResult): { [key: string]: unknown } {
    if (Boolean(res.errors)) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw res.errors;
    }
    return res.data ?? res;
  }

  /**
   * Extracts HttpResponse.
   * @param res Http response
   */
  public extractHttpResponse<T>(res: HttpResponse<T>) {
    return res.body;
  }

  /**
   * Check error status, and reset token if status is 401.
   * Note on errors:
   * 401 - unauthorized token expired
   * @param status error status
   */
  public checkErrorStatusAndRedirect(status: HTTP_STATUS): void {
    if (status === HTTP_STATUS.UNAUTHORIZED) {
      void this.store.dispatch(new userActions.setState({ token: '' })).subscribe();
    }
  }

  public getErrorMessage(error: HttpErrorResponse): string {
    const msg: string = error.message ? error.message : error.error;
    const errorMessage: string = msg
      ? msg
      : error.status
      ? `${error.status} - ${error.statusText}`
      : 'Server error';
    return errorMessage;
  }

  /**
   * Handles error.
   * @param error error object
   */
  public handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = this.getErrorMessage(error);
    this.toaster.showToaster(errorMessage, 'error');
    return throwError(errorMessage);
  }

  /**
   * Handles graphQL error response.
   * @param error error message
   */
  public handleGraphQLError(error: string): Observable<never> {
    return throwError(error);
  }

  /**
   * Taps progress.
   * @param withProgress indicates whether progress should be shown
   */
  public tapProgress<T>(widhProgress: boolean): MonoTypeOperatorFunction<T> {
    let handler: () => MonoTypeOperatorFunction<T> = () =>
      tap<T>(
        () => void 0,
        () => void 0,
      );
    if (widhProgress) {
      handler = this.httpProgress.handlers.mainView.tapStopperObservable;
    }
    return tap(handler, handler, handler);
  }

  /**
   * Taps errors.
   */
  public tapError<T>(): MonoTypeOperatorFunction<T> {
    return tap(
      (): void => void 0,
      (error: { networkError: HttpErrorResponse }) => {
        const unauthorized: boolean =
          Boolean(error.networkError) && error.networkError.status === HTTP_STATUS.BAD_REQUEST;
        if (unauthorized) {
          this.checkErrorStatusAndRedirect(HTTP_STATUS.UNAUTHORIZED);
        }
      },
    );
  }
}
