import { HttpStatus } from '@nestjs/common';
import { IResponse } from '../interfaces/response.interface';


export class ResponseError implements IResponse {
  constructor(infoMessage: string, data?: any, statusCode?: number) {
    this.success = false;
    this.statusCode = statusCode ? statusCode : HttpStatus.BAD_REQUEST;
    this.message = infoMessage;
    this.data = data;
  }
  message: string;
  data: any[];
  errorMessage: any;
  error: any;
  success: boolean;
  statusCode: number;
}

export class ResponseSuccess implements IResponse {
  constructor(infoMessage: string, data?: any, statusCode?: number) {
    this.success = true;
    this.statusCode = statusCode ? statusCode : HttpStatus.OK;
    this.message = infoMessage;
    this.data = data;
  }
  message: string;
  data: any[];
  errorMessage: any;
  error: any;
  success: boolean;
  statusCode: number;
}