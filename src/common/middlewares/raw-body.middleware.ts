import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    
    bodyParser.raw({ type: 'application/json', limit: '50mb' })(req, res, () => {
      req['rawBody'] = req.body;  // Store the raw body in req['rawBody']
      console.log(req['rawBody'],"gfgfdg")
      next();  // Proceed to the next middleware/controller
    });
  }
}