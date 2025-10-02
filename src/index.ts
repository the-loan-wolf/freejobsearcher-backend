import { Hono } from 'hono'
import { cors } from 'hono/cors'
import route from './routes/routes'

const app = new Hono()

// CORS should be called before the route
app.use('/*', cors())

app.route('/', route);

export default app
