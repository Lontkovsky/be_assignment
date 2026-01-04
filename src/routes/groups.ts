import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import {
  listGroups,
  removeUserFromGroupHandler,
} from "../controllers/groupsController";

const router = Router();

router.get("/", asyncHandler(listGroups));
router.delete(
  "/:groupId/users/:userId",
  asyncHandler(removeUserFromGroupHandler)
);

export default router;
