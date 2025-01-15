import express, { Router } from "express";
import {analyticsAlias ,  overall,  topic} from "../controllers/analytics.controller.js";
import protectRoute from "../middleware/protectRourte.js";

const routes = Router()

routes.get("/analytics/:alias" ,protectRoute,   analyticsAlias )

routes.get("/analytics/topic/:topic" ,protectRoute,  topic )

routes.get("/analytics" ,protectRoute,  overall)

export default routes 