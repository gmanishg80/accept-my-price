import { HttpStatus, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { ResponseMessage } from 'src/common/constants/message';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';
import { Model } from 'mongoose';
import { UserService } from 'src/users/user.service';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private userService: UserService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extracts token from "Bearer <token>"
        console.log('from middleware', token)
        if (!token) {
              throw new UnauthorizedException('Token not provided');
            // return new ResponseError(ResponseMessage.TOKEN_NOT_FOUND, null, HttpStatus.BAD_REQUEST);
        }

        try {
            // Verify the token with the secret key
            const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
            if(!decoded) {
                throw new UnauthorizedException(ResponseMessage.INVALID_TOKEN);
                // return new ResponseError(ResponseMessage.INVALID_TOKEN, null, HttpStatus.UNAUTHORIZED);
            }
            // console.log('from middleware mmmmmmmmm', decoded)
            const findUser = await this.userService.currentUserData(decoded?.userId); 
            if(!findUser) {
                throw new UnauthorizedException(ResponseMessage.INVALID_TOKEN);
                // return new ResponseError(ResponseMessage.INVALID_TOKEN, null, HttpStatus.UNAUTHORIZED);
            }

            const findUserAuthToken = await this.userService.userAuthTokenData(token); 
            if(!findUserAuthToken) {
                throw new UnauthorizedException(ResponseMessage.AUTH_TOKEN_EXPIRED);
                // return new ResponseError(ResponseMessage.INVALID_TOKEN, null, HttpStatus.UNAUTHORIZED);
            }

            req['currentUser'] = findUser; // Attaches decoded user info to the request
            next(); // Proceed to the next middleware or route handler
        }
        catch (error) {
            console.log('hre', error)
            throw new UnauthorizedException(ResponseMessage.INVALID_TOKEN);
            // return new ResponseError(ResponseMessage.INVALID_TOKEN, null, HttpStatus.UNAUTHORIZED);
        }
    }
}
