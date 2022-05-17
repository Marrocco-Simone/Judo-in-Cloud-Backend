import { Response } from 'express';

export function fail(res: Response, message: string, code = 400) {
  res.status(code).json({
    status: 'fail',
    message,
  });
}

export function error(res: Response, message: string, code = 500) {
  res.status(code).json({
    status: 'error',
    message,
  });
}

export function success(res: Response, data: any, code = 200) {
  res.status(code).json({
    status: 'success',
    data,
  });
}

export const unauthorized = function (res: Response) {
  fail(res, 'Unauthorized', 401);
};
