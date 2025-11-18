import { Router, Request, Response } from "express";
import { blogsService } from "../services/blogs.service.js";
import { postsService } from "../services/posts.service.js";
import { HTTP_STATUSES } from "../constants/http-statuses.js";
import { ERROR_MESSAGES } from "../constants/error-messages.js";
import type { BlogResponseDto } from "../types/domain/blog.types.js";
import type { PostResponseDto } from "../types/domain/post.types.js";
import type {
  PaginatedSortedResponse,
  PaginationSortParams,
} from "../types/domain/pagination.types.js";
import { basicAuthMiddleware } from "../middlewares/basic-auth.middleware.js";
import {
  blogValidationMiddleware,
  createPostForBlogValidationMiddleware,
} from "../middlewares/validation.middleware.js";
import { getPaginationSortParams } from "../utils/pagination-sort.utils.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const paginationSortParams: PaginationSortParams = getPaginationSortParams(
      req.query,
      "blogs"
    );
    const result: PaginatedSortedResponse<BlogResponseDto> =
      await blogsService.getBlogs(paginationSortParams);
    res.status(HTTP_STATUSES.OK).send(result);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blog: BlogResponseDto | null = await blogsService.getBlogById(id);

    if (!blog) {
      return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
    }

    res.status(HTTP_STATUSES.OK).send(blog);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.post(
  "/",
  basicAuthMiddleware,
  blogValidationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { name, description, websiteUrl } = req.body;
      const blog: BlogResponseDto = await blogsService.createBlog({
        name,
        description,
        websiteUrl,
      });
      res.status(HTTP_STATUSES.CREATED).send(blog);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.put(
  "/:id",
  basicAuthMiddleware,
  blogValidationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, websiteUrl } = req.body;
      const updateResult: boolean = await blogsService.updateBlog(id, {
        name,
        description,
        websiteUrl,
      });

      if (!updateResult) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

router.delete(
  "/:id",
  basicAuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleteResult: boolean = await blogsService.deleteBlog(id);

      if (!deleteResult) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND);
      }

      res.sendStatus(HTTP_STATUSES.NO_CONTENT);
    } catch (error) {
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

// posts
router.get("/:blogId/posts", async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;
    const blog: BlogResponseDto | null = await blogsService.getBlogById(blogId);

    if (!blog) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND)
        .send({ message: ERROR_MESSAGES.BLOG_NOT_FOUND });
    }

    const paginationSortParams: PaginationSortParams = getPaginationSortParams(
      req.query,
      "posts"
    );
    const result: PaginatedSortedResponse<PostResponseDto> =
      await postsService.getPostsByBlogId(blogId, paginationSortParams);
    res.status(HTTP_STATUSES.OK).send(result);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

router.post(
  "/:blogId/posts",
  basicAuthMiddleware,
  createPostForBlogValidationMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { blogId } = req.params;
      const { title, shortDescription, content } = req.body;

      const post: PostResponseDto = await postsService.createPost({
        title,
        shortDescription,
        content,
        blogId,
      });
      res.status(HTTP_STATUSES.CREATED).send(post);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === ERROR_MESSAGES.BLOG_NOT_FOUND
      ) {
        return res
          .status(HTTP_STATUSES.NOT_FOUND)
          .send({ message: ERROR_MESSAGES.BLOG_NOT_FOUND });
      }
      res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
    }
  }
);

export default router;
