import express from "express";

import {
  getAllUsers,
  blockUser,
  deleteUser,
  getAllProperties,
  deleteProperty,
  getAllInquiries,
  getDashboardStats,
  getPendingSeller,
  approveSeller,
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const adminRouter = express.Router();

adminRouter.use(protect);
adminRouter.use(authorize("admin"));

adminRouter.get("/users", getAllUsers);
adminRouter.patch("/users/:id/block", blockUser);
adminRouter.delete("/users/:id", deleteUser);

adminRouter.get("/properties", getAllProperties);
adminRouter.delete("/properties/:id", deleteProperty);

adminRouter.get("/inquiries", getAllInquiries);
adminRouter.get("/stats", getDashboardStats);

adminRouter.get("/pending-sellers", getPendingSeller);
adminRouter.patch("/approve-seller/:id", approveSeller);

export default adminRouter;
