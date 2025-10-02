import { Hono } from 'hono'
import { authlogin, authRefresh, authSignup } from '../controllers/auth';

const auth = new Hono();

auth.post('/login', authlogin);
auth.post('/signup', authSignup);
auth.post('/refresh', authRefresh);

export default auth;
