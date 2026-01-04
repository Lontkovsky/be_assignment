import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { listUsers, updateUserStatuses } from "../controllers/usersController";

const router = Router();

router.get("/", asyncHandler(listUsers));
router.patch("/statuses", asyncHandler(updateUserStatuses));

export default router;
