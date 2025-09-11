import { DurableObject } from 'cloudflare:workers'
import { durableObjectRouter } from './server'

export class MyDurableObject extends DurableObject<Environment> {

  fetch(request: Request): Promise<Response> {
    return durableObjectRouter.handler(request, this.env, this.ctx)
  }

}
