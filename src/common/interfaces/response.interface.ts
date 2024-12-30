export interface IResponse {
    success: boolean;
    statusCode: number;
    message: string;
    errorMessage: string;
    data: any[];
    error: any;
}