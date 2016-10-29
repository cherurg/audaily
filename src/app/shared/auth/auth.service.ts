// angular dependencies
import { Injectable } from '@angular/core'
import { Headers, Http, URLSearchParams, RequestOptions, Response } from '@angular/http'
import { Router } from '@angular/router'

// interfaces
import { Credentials } from './credentials'
import { OAuth2Token } from './oauth2token'
import { User } from './user'

// inner dependencies
import { AuthHttp } from './auth-http.service'

// external dependencies
import { Base64 } from 'js-base64'

// rxjs
import { Observable } from 'rxjs/Observable'
import { ErrorObservable } from 'rxjs/Observable/ErrorObservable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/add/operator/distinctUntilChanged'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'

@Injectable()
export class AuthService {
  public currentUser: User = null
  public loggedInUpdated: Observable<boolean>

  private loggedInStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)

  private tokenName: string = 'token'
  private _redirectLocation: string = '/' // if AuthGuard redirects user to the login page then it 
  // must redirect user to the page that they requested

  constructor(
    private http: Http,
    private authHttp: AuthHttp,
    private router: Router
  ) {
    this.init()
  }

  init(): void {
    this.loggedInUpdated = this.loggedInStatus.asObservable()
      .distinctUntilChanged()

    this.isLoggedIn()
  }

  login({ username, password }: Credentials): Observable<OAuth2Token> {
    let params = new URLSearchParams()
    params.set('username', username)
    params.set('password', password)
    params.set('grant_type', 'password')
    params.set('scope', 'read write')
    params.set('client_secret', '123456') // da hell is this?
    params.set('client_id', 'clientapp') // and this?

    let headers = new Headers()
    headers.append('Content-Type', 'application/x-www-form-urlencoded')
    headers.append('Accept', 'application/json')
    headers.append('Authorization', 'Basic ' + Base64.encode('clientapp:123456'))
    let options = new RequestOptions({ headers: headers })

    return this.http.post(`/oauth/token`, params, options)
      .map(res => res.json())
      .map(res => {
        let expiredAt = new Date()
        expiredAt.setSeconds(expiredAt.getSeconds() + res.expires_in)
        delete res.expires_in // useless information starting from this moment
        res.expires_at = expiredAt.getTime()

        let token: OAuth2Token = res
        localStorage.setItem(this.tokenName, JSON.stringify(token))
        return token
      })
      .do(() => this.loggedInStatus.next(true))
      .catch((error) => {
        console.error('auth service error! Returning null')
        console.error(error)
        return Observable.of(null)
      })
  }

  /**
   * removes local data and sends logout request to the server
   */
  logout(): Observable<Response | ErrorObservable> {
    return this.authHttp.post('/api/logout', {})
      .map((res: Response) => {
        if (res.ok) {
          return res
        } else {
          return Observable.throw('Logout error')
        }
      })
      .do(res => {
        localStorage.removeItem(this.tokenName)

        this.loggedInStatus.next(false)
      })
  }

  /**
   * checks is logged in. 
   */
  isLoggedIn(): Observable<boolean> {
    if (!localStorage.getItem(this.tokenName)) {
      return Observable.of(false)
    }

    let currentUser = this.getCurrentUser()

    return currentUser
      .map(user => !!user)
      .do((result: boolean) => this.loggedInStatus.next(result))
  }

  /**
   * Sends request to the server. Should not be used to get currentUser locally
   */
  getCurrentUser(): Observable<User> {
    let requestUser = this.authHttp.get('api/account')
      .map(res => res.json())
      .map(user => {
        user.roles = ['ROLE_USER'] // todo: do really need it?
        this.currentUser = user
        // console.log('HTTP!!!') // todo: the /api/account is called TWICE when page is
        // openned first time
        return user
      })
      .catch(error => {
        console.error('Get current user', error)
        localStorage.removeItem(this.tokenName) // remove local data
        return Observable.of(null) // if an error is cathched then there is no user
      })

    return Observable.create(subscriber => {
        subscriber.next(this.currentUser) // take value only when it is needed
        subscriber.complete()
      })
      .flatMap(user => user ? Observable.of(this.currentUser) : requestUser)
  }

  redirect() {
    this.router.navigateByUrl(this._redirectLocation)
    this._redirectLocation = '/'
  }

  set redirectLocation(location: string) {
    this._redirectLocation = location
  }

  private handleError(error: any): Observable<ErrorObservable> {
    return Observable.throw(error.json())
  }
}
