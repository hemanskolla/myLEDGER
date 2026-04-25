import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';

const router = Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL!;

function getOAuthClient() {
  return new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

router.get('/login', (_req, res) => {
  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const code = req.query['code'] as string | undefined;
  if (!code) {
    res.redirect('/?error=no_code');
    return;
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || payload.email !== ALLOWED_EMAIL) {
      res.redirect('/?error=unauthorized');
      return;
    }

    req.session.user = {
      email: payload.email,
      name: payload.name ?? payload.email,
      picture: payload.picture ?? '',
    };

    res.redirect('/crm');
  } catch {
    res.redirect('/?error=auth_failed');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).send();
  });
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json(req.session.user);
});

export default router;
