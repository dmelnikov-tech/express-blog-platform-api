import { Router, Request, Response } from "express";
import { blogsRepository } from "../repositories/blogs.repository.js";
import { HTTP_STATUSES } from "../constants/http-statuses.js";

const router = Router();

router.delete("/all-data", async (req: Request, res: Response) => {
  try {
    await blogsRepository.deleteAll();
    res.sendStatus(HTTP_STATUSES.NO_CONTENT);
  } catch (error) {
    res.sendStatus(HTTP_STATUSES.INTERNAL_SERVER_ERROR);
  }
});

export default router;
