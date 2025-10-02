import { Hono } from 'hono'
import auth from './auth';

const route = new Hono().basePath('v1');

route.route('/auth', auth);

export default route;
