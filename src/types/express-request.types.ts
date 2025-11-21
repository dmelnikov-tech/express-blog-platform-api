import { Request } from 'express';

type RequestWithBody<BodyType> = Request<{}, {}, BodyType>;

type RequestWithQuery<QueryType> = Request<{}, {}, {}, QueryType>;

type RequestWithParams<ParamsType> = Request<ParamsType>;

type RequestWithParamsAndBody<ParamsType, BodyType> = Request<ParamsType, {}, BodyType>;

type RequestWithParamsAndQuery<ParamsType, QueryType> = Request<ParamsType, {}, {}, QueryType>;

type ParamsId = { id: string };
type ParamsBlogId = { blogId: string }; //TODO: может надо использовать только id?
type ParamsPostId = { postId: string };

export {
  RequestWithBody,
  RequestWithQuery,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  ParamsId,
  ParamsBlogId,
  ParamsPostId,
};
