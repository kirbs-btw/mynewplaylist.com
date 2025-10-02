import logging
import os
from typing import Any, Optional

import jwt
from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)

SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')
SUPABASE_JWT_AUDIENCE = os.getenv('SUPABASE_JWT_AUDIENCE', '')
ANON_RECOMMENDATION_LIMIT = int(os.getenv('ANON_RECOMMENDATION_LIMIT', '5'))
AUTH_RECOMMENDATION_LIMIT = int(os.getenv('AUTH_RECOMMENDATION_LIMIT', '25'))


class AuthenticatedUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = None
    claims: dict[str, Any]


class AccessContext(BaseModel):
    user: Optional[AuthenticatedUser]
    max_recommendations: int

    @property
    def is_authenticated(self) -> bool:
        return self.user is not None


def _extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None

    try:
        scheme, token = authorization.split(' ', 1)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid Authorization header'
        ) from exc

    if scheme.lower() != 'bearer':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Authorization scheme must be Bearer'
        )

    token = token.strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Authorization token is missing'
        )

    return token


def _decode_supabase_token(token: str) -> AuthenticatedUser:
    if not SUPABASE_JWT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='Authentication is not configured'
        )

    decode_kwargs: dict[str, Any] = {
        'algorithms': ['HS256'],
        'options': {'verify_aud': bool(SUPABASE_JWT_AUDIENCE)}
    }

    if SUPABASE_JWT_AUDIENCE:
        decode_kwargs['audience'] = SUPABASE_JWT_AUDIENCE

    try:
        claims = jwt.decode(token, SUPABASE_JWT_SECRET, **decode_kwargs)
    except jwt.InvalidTokenError as exc:
        logger.warning('Invalid Supabase token: %s', exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid authentication token'
        ) from exc

    subject = claims.get('sub')
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid token payload'
        )

    return AuthenticatedUser(
        id=str(subject),
        email=claims.get('email'),
        role=claims.get('role'),
        claims=claims
    )


def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[AuthenticatedUser]:
    if not authorization:
        return None

    if not SUPABASE_JWT_SECRET:
        logger.debug('Authorization header ignored; Supabase secret not configured.')
        return None

    token = _extract_bearer_token(authorization)
    return _decode_supabase_token(token)


def get_access_context(
    user: Optional[AuthenticatedUser] = Depends(get_optional_user)
) -> AccessContext:
    limit = AUTH_RECOMMENDATION_LIMIT if user else ANON_RECOMMENDATION_LIMIT
    return AccessContext(user=user, max_recommendations=limit)


def require_authenticated_user(
    user: Optional[AuthenticatedUser] = Depends(get_optional_user)
) -> AuthenticatedUser:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Authentication required'
        )
    return user
