export class HelperREspobse {
    successResponse = (res, msg) => {
        var data = {
            status: 200,
            message: msg
        };
        return res.status(200).json(data);
    }
}