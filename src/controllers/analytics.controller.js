import { Analystic } from "../models/analytics.model.js";
import { Url } from "../models/url.model.js";

const analyticsAlias = async (req, res) => {
  try {
    const { alias } = req.params;

    // Find the URL by alias
    const url = await Url.findOne({ alias });
    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    // Extract URL ID
    const urlId = url._id;

    // Find analytics data by URL ID
    const analyticsData = await Analystic.findOne({ url: urlId });
    if (!analyticsData) {
      return res.status(404).json({ message: "Analytics not found" });
    }

    // Prepare response data
    const osTypeData = analyticsData.osType.map((os) => ({
      osName: os.osName,
      uniqueClick: os.uniqueClick,
      uniqueUsers: os.uniqueUsers.length, // Assuming os.uniqueUsers is an array
    }));

    const deviceTypeData = analyticsData.deviceType.map((device) => ({
      deviceName: device.deviceName,
      uniqueClick: device.uniqueClick,
      uniqueUsers: device.uniqueUsers.length, // Assuming device.uniqueUsers is an array
    }));

    const clickByDateData = analyticsData.clickByDate
      .slice(0, 7)
      .map((click) => ({
        date: new Date(click.date).toISOString().split("T")[0], // Extract only the date part
        clicks: click.clicks,
      }));

    // Send response
    res.json({
      totalClicks: analyticsData.totalClicks,
      uniqueUsers: analyticsData.uniqueUsers.length,
      clickByDate: clickByDateData,
      osType: osTypeData,
      deviceType: deviceTypeData,
    });
  } catch (error) {
    console.error(`Error in analyticsAlias: ${error.message}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

const topic = async (req, res) => {
  try {
    const topic = req.params.topic;

    const findTheTopicUrl = await Url.find({ topic });
    if (!findTheTopicUrl) {
      return res.status(400).json({ message: "Topic not found" });
    }
    //   console.log("findTheTopicUrl:",findTheTopicUrl);

    let a = [];
    for (let i = 0; i < findTheTopicUrl.length; i++) {
      a.push(findTheTopicUrl[i].id);
    }
    // console.log("a :", a);

    let totalclicks = 0;
    let uniqueuser1 = [];

    for (let i = 0; i < a.length; i++) {
      const analyticsId = await Analystic.findOne({ url: a[i] });
      // console.log(a[i]);
      // console.log(analyticsId);

      if (analyticsId) {
        totalclicks += analyticsId.totalClicks;

        for (let j = 0; j < analyticsId.uniqueUsers.length; j++) {
          uniqueuser1.push(analyticsId.uniqueUsers[j]);
        }
      } else {
        continue;
      }
    }
    // console.log(totalclicks);
    const setUniqueuser1 = new Set(uniqueuser1);
    const uniqueUsers = setUniqueuser1.size;
    // console.log(uniqueUsers);

    //   console.log("url", urls);
    const urls = [];
    let totalclicks_eachShortUrls;
    let uniqueuser_eachShortUrls;

    const allAnalystic = [];

    for (let i = 0; i < a.length; i++) {
      const shorturl = await Url.findOne({ _id: a[i] });
      const analyticsId = await Analystic.findOne({ url: a[i] });
      if (shorturl && analyticsId) {
        const url = {
          shorturl: shorturl.shortUrl,
          totalclicks_eachShortUrls: analyticsId.totalClicks,
          uniqueuser_eachShortUrls: analyticsId.uniqueUsers.length,
        };
        urls.push(url);
      }

      if (analyticsId) {
        allAnalystic.push(analyticsId);
      }
    }
    const clickbyDate = {};
    for (let i = 0; i < allAnalystic.length; i++) {
      const analytics = allAnalystic[i];
      for (let j = 0; j < analytics.clickByDate.length; j++) {
        const { date, clicks } = analytics.clickByDate[j];

        const formattedDate = new Date(date).toISOString().split("T")[0];

        if (clickbyDate[formattedDate]) {
          clickbyDate[formattedDate] += clicks;
        } else {
          clickbyDate[formattedDate] = clicks;
        }
      }
    }
    // console.log("click",clickbyDate);

    // console.log("urls:", urls);
    // console.log("allAnalystic :" , allAnalystic);
    res.status(200).json({
      totalclicks,
      uniqueUsers,
      clickbyDate,
      urls,
    });
  } catch (error) {
    console.log("Error in topic api", error);
    res.status(500).json({ message: "Error in topic Api" });
  }
};

const overall = async (req, res) => {
  try {
    const totalUrls = await Url.countDocuments();

    // const totalAnalistic = await Analystic.countDocuments()
    const Analistic = await Analystic.find();

    let totalclicks = 0;
    let uniqueUserslist = [];
    let clickbyDate = {};
    // let count = 0
    let osClick = {};
    let individualOsClick = {};
    let deviceClick = {};
    let individualdeviceClick ={}

    for (let i = 0; i < Analistic.length; i++) {
      totalclicks += Analistic[i].totalClicks;

      uniqueUserslist = uniqueUserslist.concat(Analistic[i].uniqueUsers);

      let analisticItem = Analistic[i];

      for (let j = 0; j < analisticItem.clickByDate.length; j++) {
        let { date, clicks } = analisticItem.clickByDate[j];
        const formattedDate = new Date(date).toISOString().split("T")[0];
        if (clickbyDate[formattedDate]) {
          clickbyDate[formattedDate] += clicks;
        } else {
          clickbyDate[formattedDate] = clicks;
        }
      }

      for (let j = 0; j < analisticItem.osType.length; j++) {
        let { osName, uniqueClick } = analisticItem.osType[j];
        if (osClick[osName]) {
          osClick[osName] += uniqueClick;
        } else {
          osClick[osName] = uniqueClick;
        }
      }

      for (let j = 0; j < analisticItem.osType.length; j++) {
        let { osName, uniqueUsers } = analisticItem.osType[j];

        // Ensure the uniqueUsers are an array, split if it's a string
        let usersArray = Array.isArray(uniqueUsers)
          ? uniqueUsers
          : uniqueUsers.split(",");

        // Use a Set to prevent duplicates
        if (individualOsClick[osName]) {
          individualOsClick[osName] = new Set([
            ...individualOsClick[osName],
            ...usersArray,
          ]);
        } else {
          individualOsClick[osName] = new Set(usersArray);
        }
      }
      for (let j = 0; j < analisticItem.deviceType.length; j++) {
        let { deviceName, uniqueClick } = analisticItem.deviceType[j];
        if (deviceClick[deviceName]) {
          deviceClick[deviceName] += uniqueClick;
        } else {
          deviceClick[deviceName] = uniqueClick;
        }
      }

      for (let j = 0; j < analisticItem.deviceType.length; j++) {
        let { deviceName, uniqueUsers} = analisticItem.deviceType[j];

        let deviceusersArray = Array.isArray(uniqueUsers)
          ? uniqueUsers
          : uniqueUsers.split(",");

        // Use a Set to prevent duplicates
        if (individualdeviceClick[deviceName]) {
          individualdeviceClick[deviceName] = new Set([
            ...individualdeviceClick[deviceName],
            ...deviceusersArray,
          ]);
        } else {
          individualdeviceClick[deviceName] = new Set(deviceusersArray);
        }
      }

    }

    for (let osName in individualOsClick) {
      individualOsClick[osName] = Array.from(individualOsClick[osName]);
    }

    let result = {};
    for (let osName in osClick) {
      result[osName] = {
        uniqueClicks: osClick[osName],
        uniqueUsers: individualOsClick[osName].length,
      };
    }
    for (let deviceName in individualdeviceClick) {
      individualdeviceClick[deviceName] = Array.from(individualdeviceClick[deviceName]);
    }

    let deviceresult = {};
    for (let deviceName in deviceClick) {
      deviceresult[deviceName] = {
        uniqueClicks: deviceClick[deviceName],
        uniqueUsers: individualdeviceClick[deviceName].length,
      };
    }

    // console.log(individualOsClick);

    // console.log(uniqueUserslist);
    let uniqueuser = new Set(uniqueUserslist);
    // console.log(uniqueuser);
    // console.log(clickbyDate);

    res.status(200).json({
      totalUrls,
      totalclicks,
      uniqueuser: uniqueuser.size,
      clickbyDate,
      osType :result,
      deviceType:deviceresult
    });
  } catch (error) {
    console.log("Error in overall api", error);
    res.status(500).json({ message: "Error in overall api" });
  }
};

export { analyticsAlias, topic, overall };
