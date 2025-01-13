import jwt from 'jsonwebtoken';

const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    // Set the cookie with the token
    res.cookie('jwt', token, {
        maxAge: 60 * 60 * 1000, // 1 hour
        httpOnly: true, // Prevent XSS attacks
        secure: process.env.NODE_ENV !== 'development', // Enable in production
        sameSite: 'Strict', // Prevent CSRF attacks
    });

    return token;
};

export default generateToken;
