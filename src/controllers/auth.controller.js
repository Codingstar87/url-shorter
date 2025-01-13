import { User } from "../models/user.model.js"; 

const googleSignup = async (profile) => {
  try {
    const googleId = profile.id; 
    const userName = profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`; 
    const email = profile.emails?.[0]?.value; 
    const profilePhoto = profile.photos?.[0]?.value; 

    const userExist = await User.findOne({ googleId });

    if (!userExist) {
      const newUser = new User({
        googleId,
        userName,
        email,
        profilePhoto,
      });

      const savedUser = await newUser.save();

      return savedUser;  
     
    }

    return userExist; 
    

  } catch (error) {
    console.error("Error in googleSignup:", error);
    throw error;  
  }
};

export default googleSignup;
