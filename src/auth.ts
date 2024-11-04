import { NextFunction, Request, Response } from 'express'
import { generateState, OAuth2Client, OAuth2RequestError } from 'oslo/oauth2'
import env from './env.js'

export const openidConfiguration = await fetch(env.openIDConfig).then((res) =>
  res.json()
)

const Zitadel = new OAuth2Client(
  env.openIDClient,
  openidConfiguration.authorization_endpoint, // TODO error on improper openid configuration
  openidConfiguration.token_endpoint,
  {
    redirectURI: env.publicUrl + '/auth/callback',
  }
)

export default Zitadel

export async function login(req: Request, res: Response) {
  const state = generateState()
  const url = await Zitadel.createAuthorizationURL({
    state,
    scopes: ['openid', 'profile', 'email'],
  })

  res.status(302)
  res.cookie('z_oauth_state', state, {
    httpOnly: true,
    secure: !env.debug,
    maxAge: 60 * 1000,
    // expires: false,
    path: '/',
    signed: !env.debug,
    // sameSite: "lax",
  })
  res.setHeader('Location', url.toString())
  res.send()
}

export async function checkAuthStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.headers.authorization == undefined) {
    res.status(401)
    res.send()
    return
  }

  const [type, token] = req.headers.authorization.split(' ')

  if (type != 'Bearer') {
    res.status(401)
    res.send()
    return
  }

  // console.log(token);

  const _token = await fetch(openidConfiguration.introspection_endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        env.openIDClient + ':' + env.openIDSecret
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `token=${token}`,
  }).then((res) => res.json())

  if (_token.active) {
    req.user_token = token
    req.user = _token
    next()
  } else {
    res.status(401)
    res.send()
  }
}

export async function authCallback(req: Request, res: Response) {
  const expectedState =
    (env.debug ? req.cookies.z_oauth_state : req.signedCookies.z_oauth_state) ??
    null
  const state = req.query.state ?? null
  const code = req.query.code ?? null

  console.log(env.debug)
  console.log(req.cookies)
  console.log(req.signedCookies)

  if (expectedState == null || state != expectedState || code == null) {
    res.status(400)
    console.log(expectedState, state, code)
    res.send()
    return
  }

  try {
    const { access_token /* , refresh_token */, expires_in } =
      await Zitadel.validateAuthorizationCode(code as string, {
        credentials: env.openIDSecret,
      })

    res.render('token', {
      token: access_token,
      expiry: Date.now() / 1000 + expires_in!,
      // refresh: refresh_token,
      title: 'Signing in..',
    })
  } catch (err) {
    if (err instanceof OAuth2RequestError) {
      res.status(400)
      res.render('error', {
        title: 'OAuth Bad Request',
        error: '400',
        message: err.message,
      })
      console.log(err)
    } else {
      res.status(500)
      res.render('error', {
        title: 'Internal Server Error',
        error: '500',
        message: 'Something broke, not your fault.',
      })
    }
  }
}

export async function logout(req: Request, res: Response) {
  await fetch(openidConfiguration.revocation_endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        env.openIDClient + ':' + env.openIDSecret
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `token=${req.user_token}`,
  })

  res.send()
}
