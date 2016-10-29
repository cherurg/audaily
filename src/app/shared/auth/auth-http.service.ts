import { Injectable } from '@angular/core'
import {
  Http,
  RequestOptions,
  RequestOptionsArgs,
  Headers,
  Request,
  Response,
  RequestMethod,
} from '@angular/http'

import { OAuth2Token } from './oauth2token'

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/fromPromise'

export interface IAuthConfig {
  globalHeaders: Array<Object>
  headerName: string
  headerPrefix: string
  noTokenScheme?: boolean
  tokenGetter: () => OAuth2Token & Promise<OAuth2Token>
  tokenName: string
}

function defaultTokenGetter(): OAuth2Token {
  let token: OAuth2Token = JSON.parse(localStorage.getItem(this.tokenName))
  return token
}

export class AuthConfig {

  public globalHeaders: Array<Object>
  public headerName: string
  public headerPrefix: string
  public noTokenScheme: boolean
  public tokenGetter: () => OAuth2Token & Promise<OAuth2Token>
  public tokenName: string

  constructor(config: any = {}) {
    this.globalHeaders = config.globalHeaders || []
    this.headerName = config.headerName || 'Authorization'
    if (config.headerPrefix) {
      this.headerPrefix = config.headerPrefix + ' '
    } else if (config.noTokenScheme) {
      this.headerPrefix = ''
    } else {
      this.headerPrefix = 'Bearer '
    }
    this.noTokenScheme = config.noTokenScheme || false
    this.tokenGetter = config.tokenGetter ||  defaultTokenGetter
    this.tokenName = config.tokenName || 'token'
  }

  public getConfig(): IAuthConfig {
    return {
      globalHeaders: this.globalHeaders,
      headerName: this.headerName,
      headerPrefix: this.headerPrefix,
      noTokenScheme: this.noTokenScheme,
      tokenGetter: this.tokenGetter,
      tokenName: this.tokenName,
    }
  }
}

// todo: defOpts
@Injectable()
export class AuthHttp {
  private config: IAuthConfig

  constructor(options: AuthConfig, private http: Http) {
    this.config = options.getConfig()
  }

  public setGlobalHeaders(headers: Array<Object>, request: Request | RequestOptionsArgs) {
    if (!request.headers) {
      request.headers = new Headers()
    }
    headers.forEach((header: Object) => {
      let key: string = Object.keys(header)[0]
      let headerValue: string = header[key]
      request.headers.set(key, headerValue)
    })
  }

  public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    if (typeof url === 'string') {
      return this.get(url, options) // Recursion: transform url from String to Request
    }

    // from this point url is always an instance of Request
    let req: Request = url as Request
    let token: OAuth2Token & Promise<OAuth2Token> = this.config.tokenGetter()
    if (token.then) {
      return Observable.fromPromise(token)
          .flatMap((gottenToken: OAuth2Token) => this.requestWithToken(req, gottenToken))
    } else {
      return this.requestWithToken(req, token)
    }
  }

  public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Get, url: url }, options)
  }

  public post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: body, method: RequestMethod.Post, url: url }, options)
  }

  public put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: body, method: RequestMethod.Put, url: url }, options)
  }

  public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Delete, url: url }, options)
  }

  public patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: body, method: RequestMethod.Patch, url: url }, options)
  }

  public head(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Head, url: url }, options)
  }

  public options(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({ body: '', method: RequestMethod.Options, url: url }, options)
  }

  private requestWithToken(req: Request, token: OAuth2Token): Observable<Response> {
    if (token === null) {
      return new Observable<Response>((obs: any) => {
        obs.error(new Error('Token does not exist'))
      })
    } else if (isTokenExpired(token)) {
      return new Observable<Response>((obs: any) => {
        obs.error(new Error('Token had expired'))
      })
    } else {
      req.headers.set(this.config.headerName, this.config.headerPrefix + token.access_token)
    }

    return this.http.request(req)
  }

  private requestHelper(
      requestArgs: RequestOptionsArgs,
      additionalOptions?: RequestOptionsArgs
    ): Observable<Response> {

    let options = new RequestOptions(requestArgs)
    if (additionalOptions) {
      options = options.merge(additionalOptions)
    }
    return this.request(new Request(this.mergeOptions(options)))
  }

  private mergeOptions(providedOpts: RequestOptionsArgs, defaultOpts?: RequestOptions) {
    let newOptions = defaultOpts || new RequestOptions()
    if (this.config.globalHeaders) {
      this.setGlobalHeaders(this.config.globalHeaders, providedOpts)
    }

    newOptions = newOptions.merge(new RequestOptions(providedOpts))

    return newOptions
  }
}

function getTokenExpirationDate(token: OAuth2Token): Date {
  let date = new Date(0) // The 0 here is the key, which sets the date to the epoch
  date.setUTCSeconds(token.expires_at)
  return date
}

function isTokenExpired(token: OAuth2Token): boolean {
  let date = getTokenExpirationDate(token)

  // not sure is that trully needed
  if (date.getSeconds() === new Date().getSeconds()) {
    return false
  }

  // Token expired?
  return !(date.valueOf() > (new Date().valueOf()))
}

export function provideAuth(config = {}): any {
  return {
    provide: AuthHttp,
    deps: [Http],
    useFactory: (http: Http) => {
      return new AuthHttp(new AuthConfig(config), http)
    },
  }
}
