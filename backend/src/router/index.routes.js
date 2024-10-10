import express from "express";
import user_routes from "./user.routes.js";
import tag_routes from "./tag.routes.js";
import auth_routes from "./auth.routes.js";
import sheet_routes from "./sheet.routes.js";
import authMiddleware from "../middlewares/withUserAuth.js"; // Importez le middleware combiné

// router.get("/api/v1", (req, res) => {
//   const msg = "hello from API";
//   res.json({ msg });
// });

const router = express.Router();

router.use("/user", user_routes);
router.use("/tag", tag_routes);
router.use("/authentication", auth_routes);

router.use("/sheet", authMiddleware([1, 2]), sheet_routes);

router.get("*", (req, res) => {
  res.status(404).json({ msg: "page not found" });
});

export default router;
