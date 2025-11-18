import { Request } from 'express';

type RequestWithBody<BodyType> = Request<{}, {}, BodyType>;

type RequestWithQuery<QueryType> = Request<{}, {}, {}, QueryType>;

type RequestWithParams<ParamsType> = Request<ParamsType>;

type RequestWithParamsAndBody<ParamsType, BodyType> = Request<ParamsType, {}, BodyType>;

type RequestWithParamsAndQuery<ParamsType, QueryType> = Request<ParamsType, {}, {}, QueryType>;

type ParamsId = { id: string };
type ParamsBlogId = { blogId: string };

export {
  RequestWithBody,
  RequestWithQuery,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  ParamsId,
  ParamsBlogId,
};
