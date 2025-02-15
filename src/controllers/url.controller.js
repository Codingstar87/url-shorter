import { Url } from "../models/url.model.js";
import redis from "../db/redis.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { Analystic } from "../models/analytics.model.js";
import jwt from "jsonwebtoken";
import useragent from "useragent";

const generateAlias = () => {
  return uuidv4().slice(0, 6); // Generate a 6-character alias
};

const shortenUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;

    // Validate the long URL
    if (!longUrl) {
      return res.status(400).json({ error: "longUrl is required" });
    }

    // Check if the long URL is already cached
    const cachedUrl = await redis.get(longUrl);
    if (cachedUrl) {
      return res
        .status(200)
        .json({ shortUrl: cachedUrl, message: "Cached short URL returned." });
    }

    // Check if the custom alias already exists in the database
    if (customAlias) {
      const existingAlias = await Url.findOne({ alias: customAlias });
      if (existingAlias) {
        return res
          .status(400)
          .json({ message: "This customAlias already exists." });
      }
    }

    // Generate alias if no custom alias is provided
    const alias = customAlias || generateAlias();

    // Check if the generated or provided alias already exists
    const existingUrl = await Url.findOne({ alias });
    if (existingUrl) {
      return res
        .status(400)
        .json({ message: "Generated alias or customAlias is already in use." });
    }

    // Construct the short URL
    const shortUrl = `${process.env.BASE_URL}/api/shorten/${alias}`;

    // Save the new URL to the database
    const url = new Url({
      longUrl,
      shortUrl,
      alias,
      customAlias,
      topic,
    });

    await url.save();

    // Cache the short URL in Redis with a 2-hour expiration
    await redis.set(longUrl, shortUrl, "EX", 7200);

    // Return the created short URL and creation timestamp
    return res.status(201).json({
      shortUrl,
      createdAt: url.createdAt,
    });
  } catch (error) {
    console.error("Error in shortenUrl:", error);

    // Ensure no duplicate headers are sent in case of errors
    if (!res.headersSent) {
      res.status(500).json({ message: " erroe in shortenUrl api" });
    }
  }
};












const redirect_url = async (req, res) => {
  const alias = req.params.alias;

  // console.log(alias);
  try {
    
    const urlObject = await Url.findOne({
      $or: [{ alias: alias }, { customAlias: alias }],
    });
    if (!urlObject) {
      return res.status(404).json({ message: "URL not found" });
    }

    // debugger;

    const timeStamp = new Date().toISOString();
    const userAgent = req.headers["user-agent"];
    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("ip", ipAddress);

    const geolocation = await axios
      .get(`http://ip-api.com/json/${ipAddress}`)
      .catch((err) => null);
    const location = geolocation?.data || {};

    console.log(timeStamp);
    console.log(userAgent);
    console.log(ipAddress);
    console.log(location);

    

    const urlObjectId = urlObject.id;

    let updatedAnalytics = await Analystic.findOne({ url: urlObjectId });
    const token = req.cookies.jwt;
    const decoded = jwt.decode(token);
    const payloadData = decoded.id;

    console.log("Payload Data:", payloadData);

    //os name
    const agent = useragent.parse(userAgent); 
    const osName = agent.os.family; 

    let deviceName;
    if (osName === "Windows" || osName === "macOS" || osName === "Linux") {
      deviceName = "Desktop";
    } else if (osName === "Android" || osName === "iOS") {
      deviceName = "Mobile";
    } else {
      deviceName = "Unknown";
    }

    console.log("device type", deviceName);

    //total click
    if (updatedAnalytics) {
      updatedAnalytics.totalClicks += 1;
      //uniqueuser
      if (!updatedAnalytics.uniqueUsers.includes(payloadData)) {
        updatedAnalytics.uniqueUsers.push(payloadData);
      }
      //click by date
      const today = new Date().toLocaleDateString("en-CA"); 

      const existingClickData = updatedAnalytics.clickByDate.find(
        (clickData) =>
          new Date(clickData.date).toLocaleDateString("en-CA") === today 
      );

      if (existingClickData) {
        existingClickData.clicks += 1; 
      } else {
        updatedAnalytics.clickByDate.push({
          date: today, 
          clicks: 1,
        });
      }



      
      let osData = updatedAnalytics.osType.find((os) => os.osName === osName);

      if (osData) {
       
        osData.uniqueClick += 1;
        if (!updatedAnalytics.uniqueUsers.includes(payloadData)) {
          updatedAnalytics.uniqueUsers.push(payloadData);
        }
      } else {
       
        updatedAnalytics.osType.push({
          osName: osName,
          uniqueClicks: 1,
          uniqueUsers: [payloadData],
        });
      }



     
      let deviceData = updatedAnalytics.deviceType.find(
        (device) => device.deviceName === deviceName
      );

      if (deviceData) {
    
        deviceData.uniqueClick += 1;
        if (!updatedAnalytics.uniqueUsers.includes(payloadData)) {
          updatedAnalytics.uniqueUsers.push(payloadData);
        }
      } else {
        
        updatedAnalytics.deviceType.push({
          deviceName: deviceName,
          uniqueClicks: 1,
          uniqueUsers: [payloadData],
        });
      }
    } else {
      updatedAnalytics = new Analystic({
        url: urlObjectId,
        totalClicks: 1,
        uniqueUsers: [payloadData],
        clickByDate: [
          { date: new Date().toLocaleDateString("en-CA"), clicks: 1 },
        ],
        osType: [
          {
            osName: osName,
            uniqueClicks: 1,
            uniqueUsers: [payloadData],
          },
        ],
        deviceType: [
          {
            deviceName: deviceName,
            uniqueClicks: 1,
            uniqueUsers: [payloadData],
          },
        ],
      });
    }

    await updatedAnalytics.save();
 
    res.redirect(urlObject.longUrl);
  } catch (err) {
    res.status(500).json({ message: "Error fetching URL", error: err.message });
  }
};


export { shortenUrl, redirect_url };
