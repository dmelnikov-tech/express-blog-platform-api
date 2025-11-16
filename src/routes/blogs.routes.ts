import { Router, Request, Response } from "express";
import { blogsService } from "../services/blogs.service.js";
import { HTTP_STATUSES } from "../constants/http-statuses.js";
import type { BlogResponseDto } from "../types/domain/blog.types.js";
import { basicAuthMiddleware } from "../middlewares/basic-auth.middleware.js";
import { blogValidationMiddleware } from "../middlewares/validation.middleware.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const blogs: BlogResponseDto[] = await blogsService.getAllBlogs();
    res.status(HTTP_STATUSES.OK).send(blogs);
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

export default router;
