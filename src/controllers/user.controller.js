import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const  generateAccessTokenAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // store in mongoDB 
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "something went wrong while generating referesh and  access token")
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exist: usenmar email
    // check for images , check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password  and refresh token field from response
    // check for user creation
    // return res

    const {fullName, email, username, password} = req.body
    console.log("email", email);
    console.log(password);

    if (
        [fullName, email, username, password].some((field)=>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are Required")
        
    }
    //  to check with email proper format
    function ValidateEmail(email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return true;
        }
        return false;
    }

    const existedUser = await User.findOne({
        $or:[{email},{username}]
    })
    if (existedUser) {
        throw new ApiError(409,"username or email are existing")
    }
    // multer to use check a img file path
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0) {

        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create(
        {
            fullName,
            avatar:avatar.url,
            coverImage:coverImage?.url || "",
            email,
            password,
            username:username.toLowerCase()
       })
       const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "   //no field ayar gi
       )

       if (!createdUser) {
        throw new ApiError(5000, "somthing went wrong while a registring the user")
       }

       return res.status(201).json(
        new ApiResponse(200, createdUser, "User register successfully")

       )
    
})


const loginUser = asyncHandler( async(req,res) =>{
    // req body -> data 
    // username or email
    // find the user 
    // check password
    // access and Referesh Token
    // send cookies

     const {email, username, password} = req.body
     
     if (!username || !email) {
        throw new ApiError(400, "username or email is required")
     }

     const user = await User.findOne({
        $nor:[{username},{email}]
     })

     if (!user) {
        throw new ApiError(404, "user doest not exist")
     }

     const isPasswordCorrectvalid = await user.isPasswordCorrect(password)

     if (!isPasswordCorrectvalid) {
        throw new ApiError(401,"Password is not valid" )
     }

     const {accessToken, refreshToken} = await 
     generateAccessTokenAndRefereshTokens(user._id)

     const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
     )

     const options = {
        httpOnly:true,
        secure:true,  
     }
     return res.status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken",refreshToken,options)
     .json(
        new ApiResponse(
            200,
            {
                // best practise
                user:loggedInUser,accessToken,refreshToken

            },
            "User Logged In Succeessfully"
        )
     )
})

const LogoutUser = asyncHandler( async(req,res) =>{
    // clear remove cookie
    // 

})



export {
    registerUser,
    loginUser,
    LogoutUser
}