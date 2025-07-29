const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { requireAdmin } = require("../middleware/auth");
const { courseValidation } = require("../validations/courseValidation");

router.get("/create", requireAdmin, courseController.getCreate);

router.post(
  "/create",
  courseValidation,
  requireAdmin,
  courseController.postCreate
);

router.get("/:id/edit", requireAdmin, courseController.getEdit);

router.post(
  "/:id/edit",
  courseValidation,
  requireAdmin,
  courseController.postEdit
);

router.post("/:id/delete", requireAdmin, courseController.delete);

router.get("/", courseController.getAll);
router.get("/:id", courseController.getDetails);

module.exports = router;
