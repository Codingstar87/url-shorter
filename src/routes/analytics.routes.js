import express, { Router } from "express";
import {analyticsAlias ,  overall,  topic} from "../controllers/analytics.controller.js";
import protectRoute from "../middleware/protectRourte.js";

const routes = Router()

routes.get("/analytics/:alias",   analyticsAlias )

routes.get("/analytics/topic/:topic" ,  topic )

routes.get("/analytics",  overall)

export default routes 
