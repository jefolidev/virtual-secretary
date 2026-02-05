import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20'
import { Env } from '../env/env'

export interface GoogleUser {
  email: string
  firstName: string
  lastName: string
  picture: string
  accessToken: string
  refreshToken: string
}

@Injectable()
export class GoogleAuthGuard extends PassportStrategy(GoogleStrategy) {
  constructor(private readonly configService: ConfigService<Env, true>) {
    const url = configService.get('API_URI')

    super({
      callbackURL: `${url}/auth/google/callback`,
      clientID: configService.get('GOOGLE_CALENDAR_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CALENDAR_SECRET'),
      scope: ['profile', 'https://www.googleapis.com/auth/calendar'],
    })
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    const { name, emails, photos } = profile

    const user: GoogleUser = {
      email: emails?.[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value || '',
      accessToken,
      refreshToken,
    }

    done(null, user)
  }
}
